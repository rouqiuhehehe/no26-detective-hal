/// <reference types="qs" />
/// <reference types="express" />
import NotFound from './404';
import Auth from './auth';
import Message from './message';
declare class Middleware {
    errorMiddleware: (dirPath: string) => <T extends Error>(err: import("../models/httpError").default<T>, _req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, _next: import("express").NextFunction) => import("express").Response<any, Record<string, any>>;
    message: typeof Message.messageMiddleware;
    user: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
    auth: typeof Auth.authMiddleware;
    notFound: typeof NotFound.redirect;
    constructor(errorMiddleware?: (dirPath: string) => <T extends Error>(err: import("../models/httpError").default<T>, _req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, _next: import("express").NextFunction) => import("express").Response<any, Record<string, any>>, message?: typeof Message.messageMiddleware, user?: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>, auth?: typeof Auth.authMiddleware, notFound?: typeof NotFound.redirect);
}
declare const _default: Middleware;
export default _default;
