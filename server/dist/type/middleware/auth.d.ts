import { NextFunction, Request, Response } from 'express';
export default class Auth {
    private static WHITE_URL;
    static authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
}
