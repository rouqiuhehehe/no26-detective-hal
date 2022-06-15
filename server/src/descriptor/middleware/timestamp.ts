import { ErrorMsg } from '@src/config/error';
import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import Util, { DescriptorKey } from '@util';
import { NextFunction, Request, Response } from 'express';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from '../middlewareHandle';

const EXPIRE_DATE = 60 * 1000;
export default function timestamp(target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
        if (result === DescriptorKey.CLASS) {
            classLogHandler(target as Function, DefaultMiddleWareType.TIMESTAMP, timestampMiddleware);
        } else {
            methodLogHandler(target, propertyKey!, DefaultMiddleWareType.TIMESTAMP, timestampMiddleware);
        }
    });
}

async function timestampMiddleware(req: Request, _res: Response, next: NextFunction) {
    const { timestamp } = req.query;
    const { timestamp: time } = global.baseConfig;
    if (!time) {
        return next();
    }
    if (!timestamp) {
        return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.MISSING_TIMESTAMP_ERROR));
    }
    if (Date.now() - +timestamp > EXPIRE_DATE) {
        return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.TIMESTAMP_ERRPR));
    }
    next();
}
