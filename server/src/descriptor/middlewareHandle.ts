// 父子通用中间件处理

import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import { Middleware } from '@src/types/middleware_type';
import { NextFunction, Request, Response } from 'express';
import { ControllerMetadata, RouteMethod } from './controller';

const repeatDefineError = new HttpError(Status.SERVER_ERROR, '父路由定义过的中间件不允许在子路由重复定义');

export enum DefaultMiddleWareType {
    LOG = 'log',
    AUTH = 'auth',
    AUTHORIZATION = 'authorization',
    ANTI_REPLAY = 'antiReplay',
    TIMESTAMP = 'timestamp',
    CUSTOM = 'custom',
    VALIDATOR = 'validator'
}

export interface MiddleWareArray {
    target: any;
    type: DefaultMiddleWareType;
    fn: (req: Request, res: Response, next: NextFunction) => void;
}

export const findFatherClass: (target: Object, cb: (v: Object) => boolean) => any = (
    target: Object,
    cb: (v: Object) => boolean
) => {
    const father = Object.getPrototypeOf(target);

    if (father) {
        if (cb(father)) {
            return father;
        } else {
            return findFatherClass(father, cb);
        }
    } else {
        return false;
    }
};

export const classLogHandler = (target: Function, type: DefaultMiddleWareType, middleware: Middleware) => {
    if (Reflect.hasMetadata('middleware', target)) {
        const middleware: MiddleWareArray[] = Reflect.getMetadata('middleware', target);
        if (!Reflect.hasOwnMetadata('middleware', target)) {
            // 如果自己没有中间件并且父级挂载了同type中间件，报错
            if (middleware.some((v) => v.type === type)) {
                throw repeatDefineError;
            }

            // 创建自己的中间件
            Reflect.defineMetadata('middleware', [], target);
        } else {
            // 如果自己有中间件，则通过中间件type找到父级的target，如果存在，则重复，报错
            const father = findFatherClass(target, (v) => {
                const middleware = Reflect.getOwnMetadata('middleware', v) as MiddleWareArray[];
                return middleware && middleware.some((i) => i.type === type);
            });

            if (father) {
                throw repeatDefineError;
            }
        }
    } else {
        // 如果没有则创建
        Reflect.defineMetadata('middleware', [], target);
    }

    Reflect.getOwnMetadata('middleware', target).push({
        type,
        target,
        fn: middleware
    });
};

export const methodLogHandler = (
    target: Object,
    propertyKey: string | symbol,
    type: DefaultMiddleWareType,
    middleware: Middleware
) => {
    // 拿到路由数组，如果不存在直接报错，路由定义需在中间件前
    const routes = Reflect.getOwnMetadata(ControllerMetadata.ISABSTRACTROUTES, target.constructor)
        ? Reflect.getMetadata(ControllerMetadata.ABSTRACTROUTES, target)
        : Reflect.getMetadata(ControllerMetadata.ROUTES, target);

    if (routes instanceof Array && routes.length) {
        if (Reflect.hasMetadata('middleware', target.constructor)) {
            const middleware: MiddleWareArray[] = Reflect.getMetadata('middleware', target.constructor);

            // 如果自己没有middleware，则认为middleware是父级拿到的
            if (!Reflect.hasOwnMetadata('middleware', target, propertyKey)) {
                if (middleware.some((v) => v.type === type)) {
                    throw repeatDefineError;
                }
            } else {
                // 自己有middleware，则遍历父级，如果有相同middleware则报错
                const father = findFatherClass(target, (v) => {
                    const middleware = Reflect.getOwnMetadata('middleware', v) as MiddleWareArray[];
                    return middleware && middleware.some((i) => i.type === type);
                });

                if (father) {
                    throw repeatDefineError;
                }
            }
        }

        // 遍历路由数组，找到定义中间件的项，吧中间件push进去
        const route = routes.find((v) => v.propertyKey === propertyKey);
        if (route) {
            (route.middleWare ?? (route.middleWare = [])).push({
                type,
                target,
                fn: middleware
            });
        } else {
            throw new RangeError('The route defined by the current middleware was not found');
        }
    } else {
        throw new HttpError(
            Status.SERVER_ERROR,
            `${routes} is not an array, is maybe that the descriptor in the wrong order`
        );
    }
};

export const methodMiddleware = (
    target: Object,
    propertyKey: string | symbol,
    middleware: (method: RouteMethod) => Middleware
) => {
    // 拿到路由数组，如果不存在直接报错，路由定义需在中间件前
    // 所有子类装饰器放入下一次事件循环，让父类装饰器先执行
    process.nextTick(() => {
        const routes = Reflect.getOwnMetadata(ControllerMetadata.ISABSTRACTROUTES, target.constructor)
            ? Reflect.getMetadata(ControllerMetadata.ABSTRACTROUTES, target)
            : Reflect.getMetadata(ControllerMetadata.ROUTES, target);

        if (routes instanceof Array && routes.length) {
            // 遍历路由数组，找到定义中间件的项，吧中间件push进去
            const route = routes.find((v) => v.propertyKey === propertyKey);
            if (route) {
                (route.middleWare ?? (route.middleWare = [])).push({
                    type: DefaultMiddleWareType.VALIDATOR,
                    fn: middleware(route.method),
                    target
                });
            } else {
                throw new RangeError('The route defined by the current middleware was not found');
            }
        } else {
            throw new HttpError(
                Status.SERVER_ERROR,
                `${routes} is not an array, is maybe that the descriptor in the wrong order`
            );
        }
    });
};
