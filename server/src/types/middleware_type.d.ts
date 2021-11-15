import { NextFunction, Request, Response } from 'express';

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
export type ErrorMiddleware = <T extends Error>(err: T, req: Request, res: Response, next: NextFunction) => void;
