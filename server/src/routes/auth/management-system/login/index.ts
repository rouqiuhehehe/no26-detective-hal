import { ErrorMsg } from '@src/config/error';
import { Status } from '@src/config/server_config';
import { Get, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import { DefaultMiddleWareType } from '@src/descriptor/middlewareHandle';
import Required from '@src/descriptor/required';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import bcrypt from 'bcrypt';
import request from 'request';
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
    public async getSalt(req: ExpressRequest, res: ExpressResPonse) {
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
    public async verifyCode(req: ExpressRequest, res: ExpressResPonse) {
        const { token } = req.body;

        try {
            const result = await this.verifyCodeHandle(token);

            if (result.success) {
                res.success(result);
            } else {
                res.error(new HttpError(Status.MISSING_PARAMS, result['error-codes'][0]));
            }
        } catch (error: any) {
            res.error(new HttpError(Status.MISSING_PARAMS, error.message, error));
        }
    }

    @Required(['username', 'password'])
    @Middleware([
        DefaultMiddleWareType.AUTHORIZATION,
        DefaultMiddleWareType.ANTI_REPLAY,
        DefaultMiddleWareType.TIMESTAMP
    ])
    @Post('/login')
    public login(req: ExpressRequest, res: ExpressResPonse) {
        this.loginHandle(req, res);
    }

    private async verifyCodeHandle(token: string): Promise<
        | {
              success: true;
              challenge_ts: string;
              hostname: string;
              action: string;
          }
        | {
              success: false;
              challenge_ts: string;
              hostname: string;
              'error-codes': string[];
          }
    > {
        return new Promise((resolve, reject) => {
            request.post(
                GoogleVerifyServer.URL,
                {
                    form: {
                        secret: GoogleVerifyServer.KEY,
                        response: token
                    }
                },
                (err, _res, body) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(JSON.parse(body));
                }
            );
        });
    }

    private async loginHandle(req: ExpressRequest, res: ExpressResPonse) {
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
                ...userInfo
            });
        } catch (e) {
            if (e instanceof HttpError) {
                res.error(e);
            }
        }
    }
}
