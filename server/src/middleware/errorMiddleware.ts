import HttpError from '@src/models/httpError';
import errorLogger from '@src/util/errorLogger';
import { NextFunction, Request, Response } from 'express';

export default <T extends Error>(err: HttpError<T>, req: Request, res: Response, _next: NextFunction) => {
    errorLogger(err, req);
    return res.error(err);
};
