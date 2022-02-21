import Db from '@src/bin/Db';
import redis from '@src/bin/redis';
import { ErrorMsg } from '@src/config/error';
import { Jwt_Config } from '@src/config/jwt';
import { Secret } from '@src/config/secret';
import { Status } from '@src/config/server_config';
import { Issue, LoginError } from '@src/config/user_error';
import { ParamsUserInfo, UserInfo } from '@src/types/user';
import Util from '@util';
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
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
    permission: number;
    create_date: string;
    update_date: string;
}
export default class User {
    public userInfo!: UserInfo;

    public getByUsername(name: string) {
        const sql = 'select * from user where `username` = ?';

        return db.asyncQuery<DbUser[]>(sql, [name]);
    }

    // 用户名密码认证
    public authenticate(
        userInfo: ParamsUserInfo
    ): Promise<Omit<DbUser, 'password' | 'salt' | 'id'> & { token: string }> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUserInfo = (await this.getByUsername(userInfo.username))[0];
                if (dbUserInfo) {
                    const { username, password, uid, nickname, avatar, create_date, update_date, permission } =
                        dbUserInfo;

                    await redis(async (client, quit) => {
                        const errorNum = await client.get('password_error_num:user#' + uid);

                        if (errorNum && +errorNum === 5) {
                            reject(new HttpError(Status.ACCOUNT_FREEZE, ErrorMsg.ACCOUNT_FREEZE));
                        }

                        const bcryptPassword = Util.md5Crypto(
                            Util.md5Crypto(password + Secret.PASSWORD_SECRET) + userInfo.salt
                        );

                        if (bcryptPassword === userInfo.password) {
                            const token = await this.issueToken(userInfo.username);
                            console.log(avatar);
                            const info = {
                                uid,
                                nickname,
                                token,
                                avatar: Util.getUrlWithHost(avatar),
                                create_date,
                                permission,
                                username,
                                update_date
                            };
                            await client.hSet('user:' + token, info);
                            await client.expire('user:' + token, Jwt_Config.JWT_EXPIRED);
                            await client.del('password_error_num:user#' + uid);
                            resolve(info);
                        } else {
                            await quit();
                            reject(
                                new HttpError(Status.PASSWORD_ERROR, LoginError.PASSWORD_ERROR, undefined, {
                                    uid
                                })
                            );
                        }
                    });
                } else {
                    reject(new HttpError(Status.USER_NOT_FOND, LoginError.USERNAME_ERROR));
                }
            } catch (e: any) {
                reject(new HttpError(Status.SERVER_ERROR, e.message, e));
            }
        });
    }

    public validateToken(req: ExpressRequest): Promise<JwtPayload> {
        return new Promise(async (resolve, reject) => {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                reject(new HttpError(Status.TOKEN_ERROR, Issue.TOKEN_IS_NOT_FIND));
            } else {
                try {
                    await redis(async (client) => {
                        const hasToken = await client.EXISTS('user:' + req.token);
                        if (hasToken) {
                            try {
                                const decoded = await Jwt.vailToken(token!, Jwt_Config.SECRET);
                                resolve(decoded);
                            } catch (e: any) {
                                if (e instanceof TokenExpiredError) {
                                    // TokenExpiredError token到期
                                    reject(new HttpError(Status.TOKEN_ERROR, Issue.TOKEN_IS_EXPIRED));
                                } else if (e instanceof JsonWebTokenError) {
                                    // JsonWebTokenError 报错，无效token
                                    reject(new HttpError(Status.TOKEN_ERROR, Issue.TOKEN_IS_ERROR));
                                }
                            }
                        } else {
                            reject(new HttpError(Status.TOKEN_ERROR, Issue.TOKEN_IS_EXPIRED));
                        }
                    });
                } catch (err: any) {
                    reject(new HttpError(Status.SERVER_ERROR, ErrorMsg.REDIS_ERROR, err));
                }
            }
        });
    }

    public getUserInfoByToken(req: ExpressRequest): Promise<DbUser> {
        return new Promise(async (resolve, reject) => {
            try {
                await redis(async (client, quit) => {
                    const dbUserInfo = await client.hGetAll('user:' + req.token);

                    await quit();
                    if (dbUserInfo) {
                        resolve(dbUserInfo as unknown as DbUser);
                    } else {
                        reject(new HttpError(Status.USER_NOT_FOND, LoginError.USERNAME_ERROR));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    public loginOut(req: ExpressRequest): Promise<{ value: true }> {
        return new Promise(async (resolve, reject) => {
            try {
                await redis(async (client) => {
                    const remove = await client.del('user:' + req.token);

                    if (remove === 1) {
                        resolve({
                            value: true
                        });
                    } else {
                        reject(new HttpError(Status.USER_NOT_FOND, LoginError.USERNAME_ERROR));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    private issueToken(username: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const secret = Jwt_Config.SECRET;
            const token = Jwt.issueToken(username, secret);
            try {
                resolve(token);
            } catch (err: any) {
                reject(new HttpError(Status.SERVER_ERROR, ErrorMsg.REDIS_ERROR, err));
            }
        });
    }
}
