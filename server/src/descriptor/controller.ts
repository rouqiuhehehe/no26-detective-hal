import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { DefaultMiddleWareType } from '@src/descriptor/middlewareHandle';
import { joiValidationCallback } from '@src/descriptor/validate';

export enum RouteMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

export enum ControllerMetadata {
    BASEPATH = 'basePath',
    ROUTES = 'routes',
    ISABSTRACTROUTES = 'isAbstractRoutes',
    ABSTRACTROUTES = 'abstractRoutes',
    HOMEPATH = 'homePath',
    SUPERROUTES = 'superRoutes',
    SUPERROUTESVALIDATOR = 'superRoutesValidator'
}

export enum RoutesType {
    INSERT = '/insert',
    LIST = '/',
    DELETE = '/delete',
    UPDATE = '/update',
    VIEW = '/view',
    BULKVIEW = '/bulk-view',
    BULKDELETE = '/bulk-delete',
    BULKUPDATE = '/bulk-update',
    IMPORTTEMPLATEDOWNLOAD = '/import-template-download',
    IMPORT = '/import',
    EXPORT = '/export'
}

const routesMap = [
    {
        path: RoutesType.INSERT,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.LIST,
        method: RouteMethod.GET
    },
    {
        path: RoutesType.DELETE,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.UPDATE,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.VIEW,
        method: RouteMethod.GET
    },
    {
        path: RoutesType.BULKVIEW,
        method: RouteMethod.GET
    },
    {
        path: RoutesType.BULKDELETE,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.BULKUPDATE,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.IMPORTTEMPLATEDOWNLOAD,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.IMPORT,
        method: RouteMethod.POST
    },
    {
        path: RoutesType.EXPORT,
        method: RouteMethod.POST
    }
];

export interface Route {
    propertyKey: string | symbol;
    method: RouteMethod;
    path: string;
    middleWare?: RouteMiddleWare[];
}

export interface RouteMiddleWare {
    fn: (req: Request | Record<string, any>, res?: Response, next?: NextFunction) => void;
    type: DefaultMiddleWareType;
    target: Object;
}

export type Validation = Partial<Record<ValueOf<typeof RoutesType>, Parameters<typeof joiValidationCallback>>>;
export const turnOffParamsValidateKey = 'turnOffParamsValidate';

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
                throw new HttpError(Status.SERVER_ERROR, `${propertyKey.toString()}does not in ${target}`);
            }

            let routes;
            if (Reflect.getOwnMetadata(ControllerMetadata.ISABSTRACTROUTES, target.constructor)) {
                if (!Reflect.hasOwnMetadata(ControllerMetadata.ABSTRACTROUTES, constructor)) {
                    Reflect.defineMetadata(ControllerMetadata.ABSTRACTROUTES, [], constructor);
                }
                routes = Reflect.getOwnMetadata(ControllerMetadata.ABSTRACTROUTES, constructor);
            } else {
                if (!Reflect.hasOwnMetadata(ControllerMetadata.ROUTES, constructor)) {
                    Reflect.defineMetadata(ControllerMetadata.ROUTES, [], constructor);
                }
                routes = Reflect.getOwnMetadata(ControllerMetadata.ROUTES, constructor);
            }
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
// abstract 定义父级抽象路由
// 会根据子类的homePath拼接路由
export const IsAbstractRoutes = (target: Function) => {
    Reflect.defineMetadata(ControllerMetadata.ISABSTRACTROUTES, true, target);
};

export function SuperRoutes(target: Function): void;
export function SuperRoutes(routesArr: RoutesType[] | 'single'): (target: Function) => void;
export function SuperRoutes(arg: RoutesType[] | 'single' | Function) {
    let arr: RoutesType[];
    if (typeof arg === 'function') {
        arr = Object.keys(RoutesType).map((v) => RoutesType[v]);
        defineMetaDataSuperRoutes(arg, arr);
    } else {
        if (arg === 'single') {
            arr = [RoutesType.LIST, RoutesType.INSERT, RoutesType.UPDATE, RoutesType.DELETE, RoutesType.VIEW];
        } else {
            arr = arg;
        }

        return (target: Function) => {
            defineMetaDataSuperRoutes(target, arr);
        };
    }
}

function defineMetaDataSuperRoutes(target: Function, metaData: RoutesType[]) {
    if (Reflect.hasOwnMetadata(ControllerMetadata.SUPERROUTES, target)) {
        throw new RangeError('请不要重复定义superRoutes');
    }
    Reflect.defineMetadata(ControllerMetadata.SUPERROUTES, metaData, target);
}

/**
 * 基类路由默认带auth和sign校验，测试接口时可用该装饰器，关闭校验
 */
export function TurnOffParamsValidate(target: Function) {
    Reflect.defineMetadata(turnOffParamsValidateKey, true, target);
}

/**
 * 基类路由参数校验器
 */
export function SuperRoutesValidator(validation: Validation) {
    return (target: Function) => {
        const validator = {} as Record<RoutesType, RouteMiddleWare>;

        for (const validationKey in validation) {
            if (Reflect.has(validation, validationKey)) {
                const map = routesMap.find((v) => v.path === validationKey);

                if (map) {
                    const { method } = map;
                    const params = validation[validationKey] as Parameters<typeof joiValidationCallback>;
                    validator[validationKey] = {
                        type: DefaultMiddleWareType.VALIDATOR,
                        target,
                        fn: joiValidationCallback(...params)(method)
                    };
                }
            }
        }
        if (Reflect.hasOwnMetadata(ControllerMetadata.SUPERROUTESVALIDATOR, target)) {
            throw new Error('super路由验证器重复');
        }

        Reflect.defineMetadata(ControllerMetadata.SUPERROUTESVALIDATOR, validator, target);
    };
}
