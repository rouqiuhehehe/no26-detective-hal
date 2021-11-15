import Db from '@src/bin/db';
import redis from '@src/bin/redis';
import { Jwt_Config } from '@src/config/jwt';
import { Status } from '@src/config/server_config';
import { Issue, LoginError } from '@src/config/user_error';
import { HashPasswordAndSalt, ParamsUserInfo, UserInfo } from '@src/types/user';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import HttpError from './httpError';
import { Jwt } from './jwt';

const db = new Db();

interface DbUser {
    id: number;
    uid: string;
    username: string;
    nickname: string;
    avatar: string;
    salt: string;
    password: string;
    level: number;
    create_date: string;
}
export default class User {
    public userInfo: UserInfo;

    private incrKey = 'user:ids';

    private updateSetKey = '';

    private updateHashSetKey = '';

    private SALT_BASE = 12;

    public constructor() {}
    public getByUsername(name: string) {
        const sql = 'select * from user where `username` = ?';

        return db.asyncQuery<DbUser>(sql, [name]);
    }

    // 用户名密码认证
    public authenticate(userInfo: ParamsUserInfo): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUserInfo = await this.getByUsername(userInfo.username);
                if (dbUserInfo) {
                    const bcryptPassword = await bcrypt.hash(userInfo.password, dbUserInfo.userInfo.salt!);

                    if (bcryptPassword === dbUserInfo.userInfo.password) {
                        resolve(dbUserInfo.userInfo.id!);
                    } else {
                        reject(LoginError.PASSWORD_ERROR);
                    }
                } else {
                    reject(LoginError.USERNAME_ERROR);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    public getById(id: number): Promise<User> {
        return new Promise((resolve, reject) => {
            redis.hgetall('user:' + id, (err, userInfo) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new User(userInfo as UserInfo));
                }
            });
        });
    }

    public issueToken(id: number) {
        return new Promise((resolve, reject) => {
            redis.hgetall('user:' + id, (err, userInfo) => {
                if (err) {
                    reject(err);
                } else {
                    const info = userInfo as UserInfo;
                    info.secret = Jwt_Config.SECRET + Math.random();
                    info.token = Jwt.issueToken(info.username, info.secret);
                    redis.hmset('user:' + id, info as { [key: string]: string | number }, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(info.token);
                        }
                    });
                }
            });
        });
    }

    public validateToken(req: Request) {
        return new Promise((resolve, reject) => {
            let token: string | undefined;
            if (process.env.NODE_ENV === 'development') {
                if (!req.session.uid || !req.signedCookies.uid) {
                    reject(new HttpError(Status.SERVER_ERROR, Issue.TOKEN_IS_NOT_FIND));
                }

                token =
                    req.session.authorization?.replace('Bearer ', '') ??
                    req.signedCookies.authorization?.replace('Bearer ', '');
            } else {
                if (!req.session.uid) {
                    reject(new HttpError(Status.SERVER_ERROR, Issue.TOKEN_IS_NOT_FIND));
                }
                token = req.session.authorization?.replace('Bearer ', '');
            }

            if (!token) {
                reject(new HttpError(Status.SERVER_ERROR, Issue.TOKEN_IS_NOT_FIND));
            } else {
                const id = req.session.uid;
                redis.hgetall('user:' + id, async (err, userInfo) => {
                    if (err) {
                        reject(err);
                    } else {
                        const info = userInfo as UserInfo;
                        if (info && info.token === token) {
                            try {
                                const decoded = await Jwt.vailToken(token!, info.secret!);
                                resolve(decoded);
                            } catch (e: any) {
                                reject(new HttpError(Status.SERVER_ERROR, e.message, e));
                            }
                        } else {
                            reject(new HttpError(Status.SERVER_ERROR, Issue.TOKEN_IS_ERROR));
                        }
                    }
                });
            }
        });
    }

    public save(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            if (this.userInfo.id) {
                await this.update();
                resolve(this.userInfo.id);
            } else {
                // 添加并设置自增id，返回自增id
                try {
                    redis.incr(this.incrKey, async (err, id) => {
                        if (err) {
                            reject(err);
                        } else {
                            const hash = await this.hashPassword();
                            this.userInfo.password = hash.hashPassword;
                            this.userInfo.salt = hash.salt;
                            this.userInfo.id = id;
                            this.updateHashSetKey = 'user:' + id;
                            await this.update();
                            resolve(id);
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            }
        });
    }

    // res.json 会调用toJSON方法
    public toJSON() {
        return {
            id: this.userInfo.id,
            username: this.userInfo.username
        };
    }

    private getId(name: string): Promise<number | null> {
        return new Promise((resolve, reject) => {
            redis.get('user:id:' + name, (err, id) => {
                if (err) {
                    reject(err);
                } else {
                    if (id) {
                        resolve(+id);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    private update() {
        return new Promise((resolve, reject) => {
            if (this.userInfo.id) {
                redis.set(this.updateSetKey, this.userInfo.id.toString(), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // 哈希表，适用于储存对象
                        redis.hmset(
                            this.updateHashSetKey,
                            this.userInfo as { [key: string]: string | number },
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    }
                });
            }
        });
    }

    private hashPassword(): Promise<HashPasswordAndSalt> {
        return new Promise(async (resolve, reject) => {
            // 设定盐值
            try {
                const salt = await bcrypt.genSalt(this.SALT_BASE);
                const hashPassword = await bcrypt.hash(this.userInfo.password, salt);
                resolve({
                    hashPassword,
                    salt
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}
