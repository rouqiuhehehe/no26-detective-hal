import HttpError from '@src/models/httpError';
import errorLoger from '@src/util/errorLoger';
import { NextFunction, Request, Response } from 'express';

export default (dirPath: string) =>
    <T extends Error>(err: HttpError<T>, req: Request, res: Response, _next: NextFunction) => {
        errorLoger(dirPath, req, err);
        return res.error(err);
    };
