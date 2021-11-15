import HttpError from '@src/models/httpError';
import { NextFunction, Request, Response } from 'express';
declare const _default: (dirPath: string) => <T extends Error>(err: HttpError<T>, _req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
export default _default;
