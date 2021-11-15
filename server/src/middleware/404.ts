import { Application, NextFunction, Request, Response } from 'express';

export default class NotFound {
    private static pageUrl = ['/'];

    public static redirect(use: Application['use']) {
        NotFound.pageUrl.forEach((v) => {
            use(v, NotFound.error);
        });
    }

    private static error(_req: Request, res: Response, _next: NextFunction) {
        return res.redirect('/404');
    }
}
