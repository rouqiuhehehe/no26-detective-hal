import HttpError from '@src/models/httpError';
import { UserInfo } from '@src/types/user';
import express from 'express';

declare global {
    type ExpressResPonse = express.Response;
    type ExpressRequest = express.Request;
    type NextFunction = express.NextFunction;
    interface Request {
        user: UserInfo;
    }
    namespace Express {
        type Message = (message: string, type?: string) => void;
        interface Response {
            message: Message;
            error<T extends Error>(e: HttpError<T>): void;
            success(data: Record<string, string | number | Date | boolean>): void;
        }

        interface Request {
            user: UserInfo;
        }
    }
}
export {};
