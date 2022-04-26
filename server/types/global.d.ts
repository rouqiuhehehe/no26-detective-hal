import { createClient } from 'redis';
import HttpError from '@src/models/httpError';
import express from 'express';
import { SinonAssert } from 'sinon';
import Joi from 'joi';

declare global {
    type Consturctor = abstract new (...args: any[]) => any;
    type ExpressResponse = express.Response;
    type ExpressRequest = express.Request;
    type NextFunction = express.NextFunction;

    type Pagination = {
        'FOUND_ROWS()': number;
    }[];
    // type Client = RedisClientType<typeof modules, Record<string, never>>;
    type Client = ReturnType<typeof createClient>;
    /**
     * 并集
     */
    type Intersection<T extends object, U extends object> = Pick<
        T,
        // 取出T中属于U的字段，和U中属于T的字段，取并集
        Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
    >;

    /**
     * 差集
     */
    type Diff<T extends object, U extends object> = Pick<
        T,
        // 取出T中不属于U的字段
        Exclude<keyof T, keyof U>
    >;

    /**
     * 将交叉类型合并
     */
    type Compute<T extends object> = T extends Function ? T : { [K in keyof T]: T[K] };
    /**
     * 合并接口
     */
    type Merge<T extends object, U extends object> = Compute<
        // 排除掉U中属于T的字段，和T组成交叉类型，然后合并成新接口
        T & Omit<U, keyof T>
    >;

    /**
     * 重写, U重写T
     */
    // 取出T,U的差集，再取出T,U的并集，联合成新接口
    type Overwrite<T extends object, U extends object, I = Diff<T, U> & Intersection<U, T>> = Pick<I, keyof I>;

    type Validator = (
        req: Record<string, any> | ExpressRequest,
        res?: ExpressResponse,
        next?: NextFunction,
        validateCb?: (
            error: null | Joi.ValidationError,
            req: ExpressRequest | { query?: Record<string, any>; body?: Record<string, any> | any[] },
            res?: ExpressResponse,
            next?: NextFunction
        ) => void
    ) => void;

    type ValueOf<T extends {}> = T[keyof T];

    namespace Express {
        type Message = (message: string, type?: string) => void;

        interface Response {
            message: Message;

            error<T extends Error>(e: HttpError<T>, data?: Record<string, string | number>): void;

            success<T extends Record<string, any>>(
                data?: T,
                pagination?: {
                    page: number;
                    total: number;
                }
            ): void;
        }

        interface Request {
            user: {
                uid?: string;
                token?: string;
            };
            validator?: Validator;
        }
    }

    namespace Chai {
        interface Assertion extends SinonAssert {
            abc: string;
        }
    }
}
export {};
