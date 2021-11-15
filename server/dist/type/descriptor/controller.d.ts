import { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
export declare enum RouteMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
}
export declare enum ControllerMetadata {
    BASEPATH = "basePath",
    ROUTES = "routes",
    HOMEPATH = "homePath"
}
export interface Route {
    propertyKey: string | symbol;
    method: RouteMethod;
    path: string;
    middleWare?: ((req: Request, res: Response, next: NextFunction) => void)[];
}
export declare const Get: (path?: string | undefined) => (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => void;
export declare const Post: (path?: string | undefined) => (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => void;
export declare const Put: (path?: string | undefined) => (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => void;
export declare const Delete: (path?: string | undefined) => (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => void;
export declare const Controller: (path: string, homePath?: boolean) => (target: Object) => void;
