import { NextFunction, Request, Response } from 'express';
export default class Message {
    static messageMiddleware(req: Request, res: Response, next: NextFunction): void;
    private static getMessage;
}
