import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';

export enum RouteMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

export enum ControllerMetadata {
    BASEPATH = 'basePath',
    ROUTES = 'routes',
    HOMEPATH = 'homePath'
}

export interface Route {
    propertyKey: string | symbol;
    method: RouteMethod;
    path: string;
    middleWare?: ((req: Request, res: Response, next: NextFunction) => void)[];
}

function createRouterDecorator(method: RouteMethod) {
    return (path?: string) => (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
        // 放入下一次事件循环，让父类装饰器先加载，兼容父级中间件
        process.nextTick(() => {
            const route: Route = {
                propertyKey,
                method,
                path: path || ''
            };

            let constructor;

            if (propertyKey in target) {
                constructor = target;
            } else if (propertyKey in (target as Function).prototype) {
                constructor = (target as Function).prototype;
            } else {
                throw new HttpError(Status.SERVER_ERROR, propertyKey.toString() + 'does not in ' + target);
            }

            if (!Reflect.hasOwnMetadata(ControllerMetadata.ROUTES, constructor)) {
                Reflect.defineMetadata(ControllerMetadata.ROUTES, [], constructor);
            }
            const routes = Reflect.getOwnMetadata(ControllerMetadata.ROUTES, constructor);
            routes.push(route);
        });
    };
}

export const Get = createRouterDecorator(RouteMethod.GET);
export const Post = createRouterDecorator(RouteMethod.POST);
export const Put = createRouterDecorator(RouteMethod.PUT);
export const Delete = createRouterDecorator(RouteMethod.DELETE);
export const Controller =
    (path: string, homePath = false) =>
    (target: Object) => {
        if (homePath) {
            Reflect.defineMetadata(ControllerMetadata.HOMEPATH, path, target);
        } else {
            const basePath = Reflect.getMetadata(ControllerMetadata.BASEPATH, target);

            if (basePath) {
                // tslint:disable-next-line:no-parameter-reassignment
                path = path === '/' ? '' : path;
                Reflect.defineMetadata(ControllerMetadata.BASEPATH, basePath + path, target);
            } else {
                Reflect.defineMetadata(ControllerMetadata.BASEPATH, path, target);
            }
        }
    };
