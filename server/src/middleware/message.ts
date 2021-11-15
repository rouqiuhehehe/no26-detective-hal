import { NextFunction, Request, Response } from 'express';

export default class Message {
    public static messageMiddleware(req: Request, res: Response, next: NextFunction) {
        res.message = Message.getMessage(req);

        res.error = (msg: string) => res.message(msg, 'error');
        res.locals.messages = req.session.messages ?? [];
        res.locals.removeMessages = () => {
            req.session.messages = [];
        };
        next();
    }

    private static getMessage(req: Request) {
        return (message: string, type = 'info') => {
            req.session.messages = req.session.messages ?? [];
            req.session.messages.push({
                message,
                type
            });
        };
    }
}
