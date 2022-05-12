import { Application, NextFunction, Request, Response } from 'express';
import Util from '@util';

export default class NotFound {
    private static pageUrl = ['/'];

    public static redirect(use: Application['use']) {
        NotFound.pageUrl.forEach((v) => {
            use(v, NotFound.error);
        });
    }

    private static error(req: Request, res: Response, _next: NextFunction) {
        res.locals.route = Util.getNoParamsUrl(req);
        res.locals.method = req.method;
        req.session.locals = res.locals;
        return res.redirect('/404');
    }
}
