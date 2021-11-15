import { NextFunction, Request, Response } from 'express';
export default class {
    static isInterfaceFunction(fn: any): fn is (req: Request, res: Response, next?: NextFunction) => void;
    static isFunction(fn: any): fn is (...arg: any[]) => void;
}
