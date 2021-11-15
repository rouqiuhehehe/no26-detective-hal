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
            error: (message: string) => void;
        }

        interface Request {
            user: UserInfo;
        }
    }
}
export {};
