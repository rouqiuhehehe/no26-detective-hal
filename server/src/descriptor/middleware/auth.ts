import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import Util, { DescriptorKey } from '@util';
import { NextFunction, Request, Response } from 'express';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from '../middlewareHandle';

const user = new User();
export default function Auth(target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
        if (result === DescriptorKey.CLASS) {
            classLogHandler(target as Function, DefaultMiddleWareType.AUTH, authMiddleware);
        } else {
            methodLogHandler(target, propertyKey!, DefaultMiddleWareType.AUTH, authMiddleware);
        }
    });
}
async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        await user.validateToken(req);
        next();
    } catch (e) {
        if (e instanceof HttpError) {
            next(e);
        }
    }
}
