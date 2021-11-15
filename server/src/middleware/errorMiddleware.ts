import { ErrorMsg } from '@src/config/error';
import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import errorLoger from '@src/util/errorLoger';
import { NextFunction, Request, Response } from 'express';

export default (dirPath: string) =>
    <T extends Error>(err: HttpError<T>, req: Request, res: Response, _next: NextFunction) => {
        errorLoger(dirPath, req, err);
        if (process.env.NODE_ENV === 'development') {
            return res.status(Status.SUCCESS).send({
                status: err.status,
                success: false,
                message: err.message
            });
        } else {
            return res.status(err.status).send(ErrorMsg.SERVER_ERROR);
        }
    };
