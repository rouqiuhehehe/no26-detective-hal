import Db from '@src/bin/db';
import redis from '@src/bin/redis';
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
    level: number;
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
                    const { username, password, uid, nickname, avatar, create_date, update_date, level } = dbUserInfo;

                    const bcryptPassword = Util.md5Crypto(
                        Util.md5Crypto(password + Secret.PASSWORD_SECRET) + userInfo.salt
                    );

                    if (bcryptPassword === userInfo.password) {
                        const token = await this.issueToken(userInfo.username, uid);
                        resolve({
                            uid,
                            nickname,
                            token,
                            avatar,
                            create_date,
                            level,
                            username,
                            update_date
                        });
                    } else {
                        reject(new HttpError(Status.PASSWORD_ERROR, LoginError.PASSWORD_ERROR));
                    }
                } else {
                    reject(new HttpError(Status.USER_NOT_FOND, LoginError.USERNAME_ERROR));
                }
            } catch (e: any) {
                reject(new HttpError(Status.SERVER_ERROR, e.message, e));
            }
        });
    }

    public validateToken(req: ExpressRequest): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                reject(new HttpError(Status.TOKEN_ERROR, Issue.TOKEN_IS_NOT_FIND));
            } else {
                const uid = req.session.uid;

                redis.hgetall('user:' + uid, async (err, userInfo) => {
                    if (err) {
                        reject(new HttpError(Status.SERVER_ERROR, err.message, err));
                    } else {
                        const info = userInfo as UserInfo;
                        if (info && info.token === token) {
                            try {
                                const decoded = await Jwt.vailToken(token!, info.secret!);
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
                            reject(new HttpError(Status.TOKEN_ERROR, Issue.TOKEN_IS_ERROR));
                        }
                    }
                });
            }
        });
    }

    public getUserInfoByToken(req: ExpressRequest): Promise<Omit<DbUser, 'password' | 'salt' | 'id' | 'uid'>> {
        return new Promise(async (resolve, reject) => {
            try {
                const decoded = await this.validateToken(req);

                const { data } = decoded;

                const dbUserInfo = (await this.getByUsername(data))[0];

                if (dbUserInfo) {
                    const { username, update_date, nickname, avatar, create_date, level } = dbUserInfo;

                    resolve({
                        nickname,
                        avatar,
                        create_date,
                        level,
                        username,
                        update_date
                    });
                } else {
                    reject(new HttpError(Status.USER_NOT_FOND, LoginError.USERNAME_ERROR));
                }
            } catch (e) {
                if (e instanceof HttpError) {
                    reject(e);
                }
            }
        });
    }

    private issueToken(username: string, uid: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const secret = Jwt_Config.SECRET + Math.random();
            const info: UserInfo = {
                username,
                secret,
                uid,
                token: Jwt.issueToken(username, secret)
            };
            redis.hmset('user:' + uid, info, (err) => {
                if (err) {
                    reject(new HttpError(Status.SERVER_ERROR, err.message, err));
                } else {
                    resolve(info.token);
                }
            });
        });
    }
}
