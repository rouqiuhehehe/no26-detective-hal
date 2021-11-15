import { NextFunction, Request, Response } from 'express';

export default class {
    public static isInterfaceFunction(fn: any): fn is (req: Request, res: Response, next?: NextFunction) => void {
        return typeof fn === 'function';
    }

    public static isFunction(fn: any): fn is (...arg: any[]) => void {
        return typeof fn === 'function';
    }
}
