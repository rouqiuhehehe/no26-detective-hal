import HttpError from '@src/models/httpError';
import errorLogger from '@src/util/errorLogger';
import { NextFunction, Request, Response } from 'express';

export default <T extends Error>(err: HttpError<T>, req: Request, res: Response, _next: NextFunction) => {
    errorLogger(err, req);
    // 兼容node内部报错
    return res.error
        ? res.error(err)
        : res.send({
              status: err.status,
              success: false,
              message: err.message
          });
};
