import { ControllerMetadata, Route, RouteMiddleWare, turnOffParamsValidateKey } from '@src/descriptor/controller';
import { DefaultMiddleWareType, findFatherClass, MiddleWareArray } from '@src/descriptor/middlewareHandle';
import { Middleware } from '@src/types/middleware_type';
import express from 'express';
import fsPromise from 'fs/promises';
import path from 'path';
import Util from '@util';

// tslint:disable: no-unused-expression
const moduleArr: Promise<any>[] = [];
const loadTs = (dirPath: string): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 检测目录是否存在
            if (process.env.NODE_ENV === 'development') {
                await fsPromise.access(dirPath);
            }
            const fileName = await fsPromise.readdir(dirPath);

            try {
                for (const name of fileName) {
                    const curPath = path.join(dirPath, name);
                    const extname = path.extname(curPath);
                    if (!extname) {
                        await loadTs(curPath);
                        continue;
                    }
                    if (/^(.*)(dao|handler).ts$/.test(name.toLocaleLowerCase())) {
                        continue;
                    }
                    if (extname === '.js' || extname === '.ts') {
                        try {
                            const module = import(`${curPath}`);
                            moduleArr.push(module);
                        } catch (error) {
                            reject(error);
                        }
                    }
                }
                resolve(moduleArr);
            } catch (error) {
                reject(error);
            }
        } catch (error) {
            reject(`${dirPath} does not exist`);
        }
    });
};

export const scanController = (dirPath: string, route: express.Application) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resultArr = await loadTs(dirPath);
            let i = 0;
            Promise.all(resultArr).then((moduleArr) => {
                moduleArr.forEach((v) => {
                    const controller = v.default || v;

                    if (controller && controller.prototype) {
                        // 路由懒加载，等待放入下一次事件循环的中间件先完成
                        process.nextTick(() => {
                            // 判断是否存在base path 以及路由，如果没有默认理解为不是路由类
                            // const isController = Reflect.hasMetadata(ControllerMetadata.BASE-PATH, controller);
                            // 导入时，方法装饰器挂载的元数据在prototype上
                            const hasRoutes = Reflect.hasMetadata(ControllerMetadata.ROUTES, controller.prototype);
                            const hasHomePath = Reflect.hasMetadata(ControllerMetadata.HOMEPATH, controller);

                            const hasStaticRoutes = Reflect.hasMetadata(ControllerMetadata.ROUTES, controller);
                            const basePath = Reflect.getMetadata(ControllerMetadata.BASEPATH, controller) ?? '/';
                            const homePath = Reflect.getMetadata(ControllerMetadata.HOMEPATH, controller);

                            if (Reflect.hasMetadata('middleware', controller)) {
                                const ownMiddleware = Reflect.getOwnMetadata('middleware', controller);
                                const middleware = Reflect.getMetadata('middleware', controller) as MiddleWareArray[];

                                // 判断装饰器是否挂载在父级路由上
                                if (!ownMiddleware || ownMiddleware !== middleware) {
                                    // 当中间件挂载在父级的时候
                                    const customMiddleware: Middleware[] = [];

                                    middleware
                                        .filter((v) => {
                                            // 过滤出所有的默认中间件
                                            if (v.type === DefaultMiddleWareType.CUSTOM) {
                                                // 自定义中间件过滤掉
                                                customMiddleware.push(v.fn);
                                                return false;
                                            }
                                            return true;
                                        })
                                        .forEach((v) => {
                                            // 找到挂载中间件的父级
                                            const target = findFatherClass(controller, (i) => {
                                                return i === v.target;
                                            });

                                            if (target) {
                                                // 如果存在，将中间件挂载在父级路由下，并删除父级类挂载的元数据
                                                const basePath = Reflect.getMetadata(
                                                    ControllerMetadata.BASEPATH,
                                                    target
                                                );
                                                const homePath = Reflect.getMetadata(
                                                    ControllerMetadata.HOMEPATH,
                                                    target
                                                );
                                                const realPath = path.posix.join(homePath, basePath ?? '');

                                                Reflect.deleteMetadata('middleware', target);

                                                route.use(realPath, v.fn);
                                            } else {
                                                // 不存在则异常错误
                                                throw new Error('unknown Error');
                                            }
                                        });

                                    // 如果存在自定义中间件,则把自定义中间件挂载在当前类的路由下
                                    customMiddleware.length &&
                                        route.use(path.posix.join(homePath, basePath ?? ''), ...customMiddleware);
                                } else {
                                    // 如果不在父级路由上，则直接挂载在当前路由下
                                    route.use(
                                        path.posix.join(homePath, basePath ?? ''),
                                        ...(
                                            (Reflect.getOwnMetadata('middleware', controller) ??
                                                []) as MiddleWareArray[]
                                        ).map((v) => v.fn)
                                    );
                                    Reflect.deleteMetadata('middleware', controller);
                                }
                            }

                            // 是否有需要继承的路由
                            const hasAbstractRoutes = Reflect.getMetadata(
                                ControllerMetadata.ISABSTRACTROUTES,
                                controller
                            );
                            // 处理导入的验证
                            // 导入的验证默认和插入的验证相同
                            let insertValidator: RouteMiddleWare;
                            if (
                                // tslint:disable-next-line: jsdoc-format
                                /**isController && */ hasHomePath &&
                                (hasRoutes || hasStaticRoutes || hasAbstractRoutes)
                            ) {
                                const needSuperRoutes: Route[] = [];
                                if (Reflect.hasOwnMetadata(ControllerMetadata.SUPERROUTES, controller)) {
                                    const defaultRoutes = Util.deepClone(
                                        Reflect.getMetadata(ControllerMetadata.ABSTRACTROUTES, controller.prototype)
                                    );
                                    const superRoutes = Reflect.getOwnMetadata(
                                        ControllerMetadata.SUPERROUTES,
                                        controller
                                    );

                                    if (!defaultRoutes || !defaultRoutes.length) {
                                        throw new RangeError('请先定义父类默认路由，再继承');
                                    }
                                    // 是否取消默认路由的auth等默认校验，用于接口测试
                                    const isTurnOffParamsValidate = Reflect.getOwnMetadata(
                                        turnOffParamsValidateKey,
                                        controller
                                    );
                                    // super路由的验证器中间件
                                    const superRoutesValidator = Reflect.getOwnMetadata(
                                        ControllerMetadata.SUPERROUTESVALIDATOR,
                                        controller
                                    );

                                    defaultRoutes.forEach((v: Route) => {
                                        if (superRoutes.includes(v.path)) {
                                            const route = { ...v };
                                            if (isTurnOffParamsValidate && route.middleWare) {
                                                route.middleWare = route.middleWare.filter(
                                                    (v) =>
                                                        !(
                                                            Object.values(DefaultMiddleWareType).includes(v.type) &&
                                                            v.type !== DefaultMiddleWareType.CUSTOM &&
                                                            v.type !== DefaultMiddleWareType.LOG
                                                        )
                                                );
                                            }
                                            if (superRoutesValidator) {
                                                const validator = superRoutesValidator[route.path];
                                                if (validator) {
                                                    // 导入验证应于插入验证一致
                                                    if (route.path === '/insert') {
                                                        insertValidator = validator;
                                                    }
                                                    route.middleWare?.push(validator);
                                                }
                                            }
                                            // 添加需要的父级路由
                                            needSuperRoutes.push(route);
                                        }
                                    });
                                }
                                const routes = [
                                    ...needSuperRoutes,
                                    ...(Reflect.getOwnMetadata(ControllerMetadata.ROUTES, controller.prototype) ?? []),
                                    ...(Reflect.getOwnMetadata(ControllerMetadata.ROUTES, controller) ?? [])
                                ] as Route[];
                                routes.forEach((v) => {
                                    // 做字符串兼容
                                    const curPath = path.posix
                                        .join(homePath, basePath, v.path)
                                        .replace(new RegExp('/$'), '');
                                    const controllerInstance = new controller();
                                    let validator = v.middleWare?.find(
                                        (v) => v.type === DefaultMiddleWareType.VALIDATOR
                                    );

                                    // 导入默认使用insert的验证
                                    if (
                                        v.path === '/import' &&
                                        !v.middleWare?.some((v) => v.type === DefaultMiddleWareType.VALIDATOR) &&
                                        insertValidator
                                    ) {
                                        validator = insertValidator;
                                    }
                                    const callback = controllerInstance[v.propertyKey].bind(controllerInstance);
                                    route[v.method](
                                        curPath,
                                        ...(v.middleWare ? v.middleWare.map((v) => v.fn) : []),
                                        (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
                                            validator && (req.validator = validator.fn);
                                            next();
                                        },
                                        callback
                                    );
                                });
                            }
                            if (i++ === moduleArr.length - 1) {
                                resolve(true);
                            }
                        });
                    } else {
                        if (i++ === moduleArr.length - 1) {
                            resolve(true);
                        }
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
};
