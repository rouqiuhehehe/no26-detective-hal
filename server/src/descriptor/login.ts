import User from '@src/models/user';
import Util, { DescriptorKey } from '@util';
import { NextFunction, Request, Response } from 'express';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from './middlewareHandle';

const loginHandle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await User.validateToken(req);
        next();
    } catch (e: any) {
        res.error(e.message);
        res.redirect('/login');
    }
};

const Login = (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
        if (result === DescriptorKey.CLASS) {
            classLogHandler(target as Function, DefaultMiddleWareType.LOGIN, loginHandle);
        } else {
            methodLogHandler(target, propertyKey!, DefaultMiddleWareType.LOGIN, loginHandle);
        }
    });
};

export default Login;
