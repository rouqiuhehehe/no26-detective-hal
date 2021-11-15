import { NextFunction, Request, Response } from 'express';
declare class LoginMiddware {
    loginUserCheck(req: Request, res: Response, next: NextFunction): void;
    addUserMiddleware(req: Request, res: Response, next: NextFunction): void;
}
declare const _default: LoginMiddware;
export default _default;
