import { Middleware } from '@src/types/middleware_type';
import { NextFunction, Request, Response } from 'express';
import { RouteMethod } from './controller';
export declare enum DefaultMiddleWareType {
    LOG = "log",
    LOGIN = "login",
    CUSTOM = "custom"
}
export interface MiddleWareArray {
    target: any;
    type: DefaultMiddleWareType;
    fn: (req: Request, res: Response, next: NextFunction) => void;
}
export declare const findFatherClass: (target: Object, cb: (v: Object) => boolean) => any;
export declare const classLogHandler: (target: Function, type: DefaultMiddleWareType, middleware: Middleware) => void;
export declare const methodLogHandler: (target: Object, propertyKey: string | symbol, type: DefaultMiddleWareType, middleware: Middleware) => void;
export declare const methodMiddleware: (target: Object, propertyKey: string | symbol, middleware: (method: RouteMethod) => Middleware) => void;
