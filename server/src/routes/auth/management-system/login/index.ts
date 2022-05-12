import redis from '@src/bin/redis';
import { ErrorMsg } from '@src/config/error';
import { Status } from '@src/config/server_config';
import { Get, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import { DefaultMiddleWareType } from '@src/descriptor/middlewareHandle';
import Required from '@src/descriptor/required';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import Util from '@util';
import axios, { AxiosResponse } from 'axios';
import bcrypt from 'bcryptjs';
import ManagementSystem from '..';

enum GoogleVerifyServer {
    URL = 'https://www.recaptcha.net/recaptcha/api/siteverify',
    KEY = '6LcIylwdAAAAAEy2vxDt3oeylMkJrE51cvY9gF65'
}
const user = new User();
export default class Login extends ManagementSystem {
    private SALT_BASE = 12;

    @Middleware([
        DefaultMiddleWareType.AUTHORIZATION,
        DefaultMiddleWareType.ANTI_REPLAY,
        DefaultMiddleWareType.TIMESTAMP
    ])
    @Get('/get-salt')
    public async getSalt(req: ExpressRequest, res: ExpressResponse) {
        const salt = await bcrypt.genSalt(this.SALT_BASE);

        req.session.salt = salt;
        res.success({
            salt
        });
    }

    @Required(['token'])
    @Middleware([
        DefaultMiddleWareType.AUTHORIZATION,
        DefaultMiddleWareType.ANTI_REPLAY,
        DefaultMiddleWareType.TIMESTAMP
    ])
    @Post('/verify-code')
    public async verifyCode(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const { token } = req.body;

        try {
            const result = await this.verifyCodeHandle(token);

            if (result.data.success) {
                res.success(result.data);
            } else {
                next(new HttpError(Status.MISSING_PARAMS, result.data['error-codes'][0]));
            }
        } catch (error: any) {
            next(new HttpError(Status.MISSING_PARAMS, error.message, error));
        }
    }

    @Required(['username', 'password'])
    @Middleware([
        DefaultMiddleWareType.AUTHORIZATION,
        DefaultMiddleWareType.ANTI_REPLAY,
        DefaultMiddleWareType.TIMESTAMP
    ])
    @Post('/login')
    public async login(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.loginHandle(req, res, next);
    }

    private async verifyCodeHandle(token: string): Promise<
        | AxiosResponse<{
              success: true;
              challenge_ts: string;
              hostname: string;
              action: string;
          }>
        | AxiosResponse<{
              success: false;
              challenge_ts: string;
              hostname: string;
              'error-codes': string[];
          }>
    > {
        return axios.post(GoogleVerifyServer.URL, undefined, {
            params: {
                secret: GoogleVerifyServer.KEY,
                response: token
            }
        });
    }

    private async loginHandle(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const { username, password } = req.body;
        const { salt } = req.session;

        if (!salt) {
            return res.error(new HttpError(Status.PASSWORD_SALT_ERROR, ErrorMsg.PASSWORD_SALT_ERROR));
        }
        try {
            const { uid, ...userInfo } = await user.authenticate({
                username,
                password,
                salt
            });

            req.session.uid = uid;
            res.success({
                ...userInfo,
                role: userInfo.role?.split(','),
                roleValue: userInfo.roleValue?.split(',')
            });
        } catch (e) {
            console.log(e);
            if (Util.isExtendsHttpError(e)) {
                if (e.status === Status.PASSWORD_ERROR) {
                    const err = e;
                    try {
                        await redis(async (client) => {
                            const num = await client.incr(`password_error_num:user#${err.query!.uid}`);

                            if (+num === 5) {
                                return res.error(new HttpError(Status.ACCOUNT_FREEZE, ErrorMsg.ACCOUNT_FREEZE));
                            }
                            err.message = `${err.message}，还剩${5 - +num}次机会`;

                            res.error(err);
                        });
                    } catch (error: any) {
                        console.log(error);

                        next(new HttpError(Status.SERVER_ERROR, ErrorMsg.REDIS_ERROR, error));
                    }
                } else {
                    next(e);
                }
            } else {
                next(new HttpError(Status.SERVER_ERROR, (e as Error).message, e as Error));
            }
        }
    }
}
