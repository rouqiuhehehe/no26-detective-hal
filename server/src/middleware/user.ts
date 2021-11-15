import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import { NextFunction, Request, Response } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.session;
    if (!uid) {
        next();
    } else {
        try {
            const user = await User.getById(uid);
            req.user = res.locals.user = user.userInfo;
            next();
        } catch (e: any) {
            next(new HttpError(Status.SERVER_ERROR, e.message ?? e));
        }
    }
};
