import User from '@src/models/user';
import Util from '@util';
import { NextFunction, Request, Response } from 'express';

export default class Auth {
    private static WHITE_URL = ['/login', '/register', '/favicon.ico', '/404', '/'];

    public static async authMiddleware(req: Request, res: Response, next: NextFunction) {
        const pathname = Util.getNoParamsUrl(req);
        const isContinue =
            pathname === '/'
                ? Auth.WHITE_URL.includes(pathname)
                : Auth.WHITE_URL.some((v) => new RegExp('^' + v).test(pathname));
        if (isContinue) {
            next();
        } else {
            try {
                await User.validateToken(req);
                next();
            } catch (e: any) {
                res.error(e.message);
                res.redirect('/login');
            }
        }
    }
}
