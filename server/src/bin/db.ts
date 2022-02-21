import serverError from '@src/util/serverError';
import Util from '@util';
import events from 'events';
import { Request } from 'express';
import FileStreamRotator from 'file-stream-rotator';
import mysql from 'mysql';
import mysqldump from 'mysqldump';
import path from 'path';
import fsPromise from 'fs/promises';

const dbconfig = fsPromise.readFile(path.join(process.cwd(), 'config', 'dbconfig.json'));
// a bunch of session variables we use to make the import work smoothly
const HEADER_VARIABLES = [
    // Add commands to store the client encodings used when importing and set to UTF8 to preserve data
    '/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;',
    '/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;',
    '/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;',
    '/*!40101 SET NAMES utf8 */;',
    // Add commands to disable foreign key checks
    '/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;',
    "/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;",
    '/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;',
    ''
].join('\n');
const FOOTER_VARIABLES = [
    '/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;',
    '/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;',
    '/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;',
    '/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;',
    '/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;',
    '/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;',
    ''
].join('\n');

type Callback<T> = (results: T, fields?: mysql.FieldInfo[]) => void;
export default class extends events.EventEmitter {
    private status = 'ready';
    private pool!: mysql.Pool;

    public constructor() {
        super();
        this.setMaxListeners(0);

        (async () => {
            const config = (await dbconfig).toString();

            this.pool = mysql.createPool(JSON.parse(config));
        })();
    }

    public asyncQuery<T>(sql: string, values?: unknown[] | string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.pool!.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                } else {
                    connection.query(sql, values, (err, result, _fields) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                    // console.log(query.sql);
                }
                connection.release();
            });
        });
    }

    /**
     * 处理事务回滚方法
     */
    public beginTransaction<T>(sql: string, values?: unknown[], cb?: Callback<T>): Promise<boolean>;
    // noinspection JSUnusedGlobalSymbols
    public beginTransaction<T>(sql: string[] | [string, unknown[]][], cb?: Callback<T>): Promise<boolean>;
    public beginTransaction<T>(
        sql: string | string[] | [string, unknown[]][],
        values?: unknown[] | Callback<T>,
        cb?: Callback<T>
    ): Promise<boolean> {
        let callback: Callback<T> | undefined;
        let sqlVal: unknown[];
        if (typeof sql !== 'string') {
            callback = values as Callback<T>;
            sqlVal = [];
        } else {
            callback = cb;
            sqlVal = values as unknown[];
        }

        return new Promise((resolve, reject) => {
            this.pool!.getConnection((err, conn) => {
                if (err) {
                    conn.release();
                    reject(err);
                } else {
                    // 开始处理事务
                    conn.beginTransaction(async (err) => {
                        if (err) {
                            conn.release();
                            reject(err);
                        } else {
                            try {
                                if (typeof sql === 'string') {
                                    const result = await this.transactionHandle(conn, sql, sqlVal);
                                    try {
                                        callback && (await callback(result as unknown as T));
                                        // 提交事务
                                        conn.commit((err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            resolve(true);
                                        });
                                    } catch (error) {
                                        conn.rollback((e) => {
                                            console.log('事务回滚');
                                            if (e) {
                                                throw e;
                                            }
                                            conn.release();
                                        });
                                        reject(error);
                                    }
                                } else {
                                    const allPromise = [];
                                    for (const value of sql) {
                                        if (typeof value === 'string') {
                                            allPromise.push(this.transactionHandle(conn, value, []));
                                        } else {
                                            const [_sql, values] = value;
                                            allPromise.push(this.transactionHandle(conn, _sql, values));
                                        }
                                    }

                                    Promise.all(allPromise).then(async (result: any[]) => {
                                        try {
                                            callback && (await callback(result as unknown as T));
                                            // 提交事务
                                            conn.commit((err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                resolve(true);
                                            });
                                        } catch (error) {
                                            conn.rollback((e) => {
                                                console.log('事务回滚');

                                                if (e) {
                                                    throw e;
                                                }
                                                conn.release();
                                            });
                                            throw error;
                                        }
                                    });
                                }
                            } catch (error: any) {
                                serverError(error);
                                reject(error);
                            }
                        }
                    });
                }
            });
        });
    }

    /**
     * 数据库备份方法
     */
    public async databaseBackup() {
        const config = (await dbconfig).toString();
        const res = await mysqldump({
            connection: JSON.parse(config)
        });

        const stream = FileStreamRotator.getStream({
            date_format: 'YYYYMMDD',
            filename: path.join(process.cwd(), 'dump/%DATE%', Date.now() + '.sql'),
            frequency: 'daily',
            verbose: false,
            max_logs: '10d'
        });

        stream.write(
            HEADER_VARIABLES + '\n' + res.dump.schema + '\n' + res.dump.data + '\n\n' + FOOTER_VARIABLES,
            'utf-8',
            (err) => {
                if (err) {
                    console.error(err);
                }
            }
        );

        stream.end();
    }

    /**
     * 加锁处理多请求
     * @param req 订阅名，用于接口订阅的锁，建议为当前接口url
     * @param sql 数据库操作语句
     * @param values 数据库操作语句values
     */
    public asyncQueryBySock<T>(req: Request | string, sql: string, values?: unknown[] | string): Promise<T> {
        const url = typeof req === 'object' ? Util.getNoParamsUrl(req) : req;
        return new Promise(async (resolve, reject) => {
            this.once(url, (res) => {
                if (res instanceof Error) {
                    reject(res);
                } else {
                    resolve(res);
                }
            });

            try {
                if (this.status === 'ready') {
                    this.status = 'pending';
                    const result = await this.asyncQuery(sql, values);
                    this.emit(url, result);
                    this.status = 'ready';
                }
            } catch (e) {
                this.emit(url, e);
            }
        });
    }

    /**
     * 处理事务方法
     */
    private transactionHandle(conn: mysql.PoolConnection, sql: string, sqlVal: unknown[]) {
        return new Promise((resolve, reject) => {
            conn.query(sql, sqlVal, async (err, result, _fields) => {
                if (err) {
                    conn.release();
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
