import dbconfig from '@src/config/db_config';
import serverError from '@src/util/serverError';
import Util from '@util';
import events from 'events';
import { Request } from 'express';
import FileStreamRotator from 'file-stream-rotator';
import mysql from 'mysql';
import mysqldump from 'mysqldump';
import path from 'path';

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

export interface Result<T> {
    result: T;
    fields?: mysql.FieldInfo[];
}

type Callback<T> = (err: mysql.MysqlError | null, results?: T, fields?: mysql.FieldInfo[]) => void;
export default class extends events.EventEmitter {
    private status = 'ready';
    private pool = mysql.createPool(dbconfig);

    public constructor() {
        super();
        this.setMaxListeners(0);
    }

    public asyncQuery<T>(sql: string, values?: unknown[]): Promise<T> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                } else {
                    connection.query(sql, values, (err, result, _fields) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                }
                connection.release();
            });
        });
    }

    /**
     * 处理事务回滚方法
     */
    public beginTransaction<T>(sql: string, values: unknown[], cb: Callback<T>): void;
    public beginTransaction<T>(sql: string, cb: Callback<T>): void;
    public beginTransaction<T>(sql: string, values: unknown[] | Callback<T>, cb?: Callback<T>): void {
        let callback: Callback<T>;
        let sqlVal: unknown[];
        if (arguments.length === 2) {
            callback = values as Callback<T>;
            sqlVal = [];
        } else {
            callback = cb!;
            sqlVal = values as unknown[];
        }

        this.pool.getConnection((err, conn) => {
            if (err) {
                callback(err);
                conn.release();
            } else {
                // 开始处理事务
                conn.beginTransaction(async (err) => {
                    if (err) {
                        callback(err);
                        conn.release();
                    } else {
                        conn.query(sql, sqlVal, async (err, result, _fields) => {
                            if (err) {
                                callback(err);
                                conn.release();
                            } else {
                                try {
                                    await callback(result);
                                    // 提交事务
                                    conn.commit((err) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                } catch (error) {
                                    serverError(error as Error);
                                    // 回滚事务
                                    conn.rollback(() => {
                                        conn.release();
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * 数据库备份方法
     */
    public async databaseBackup() {
        const res = await mysqldump({
            connection: dbconfig
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
     */
    public asyncQueryBySock<T>(req: Request, sql: string, values?: unknown[]): Promise<Result<T>> {
        const url = Util.getNoParamsUrl(req);
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
}
