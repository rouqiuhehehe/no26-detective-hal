"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanController = void 0;
const controller_1 = require("@src/descriptor/controller");
const middlewareHandle_1 = require("@src/descriptor/middlewareHandle");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const moduleArr = [];
const loadTs = (dirPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (process.env.NODE_ENV === 'development') {
                await promises_1.default.access(dirPath);
                const fileName = await promises_1.default.readdir(dirPath);
                try {
                    for (const name of fileName) {
                        const curPath = path_1.default.join(dirPath, name);
                        const dirStat = await promises_1.default.stat(curPath);
                        if (dirStat.isDirectory()) {
                            await loadTs(curPath);
                            continue;
                        }
                        if (!/(\.js|\.ts)$/.test(curPath)) {
                            continue;
                        }
                        try {
                            const module = Promise.resolve().then(() => __importStar(require(`${curPath}`)));
                            moduleArr.push(module);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                    resolve(moduleArr);
                }
                catch (error) {
                    reject(error);
                }
            }
            else {
                const modules = require.context('../routes', true, /\.ts$/, 'lazy');
                modules.keys().forEach((v) => {
                    moduleArr.push(modules(v));
                });
                resolve(moduleArr);
            }
        }
        catch (error) {
            reject(dirPath + ' does not exist');
        }
    });
};
const scanController = (dirPath, route) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resultArr = await loadTs(dirPath);
            let i = 0;
            Promise.all(resultArr).then((moduleArr) => {
                moduleArr.forEach((v) => {
                    const controller = v.default || v;
                    if (controller && controller.prototype) {
                        process.nextTick(() => {
                            const isController = Reflect.hasMetadata(controller_1.ControllerMetadata.BASEPATH, controller);
                            const hasRoutes = Reflect.hasMetadata(controller_1.ControllerMetadata.ROUTES, controller.prototype);
                            const hasHomePath = Reflect.hasMetadata(controller_1.ControllerMetadata.HOMEPATH, controller);
                            const hasStaticRoutes = Reflect.hasMetadata(controller_1.ControllerMetadata.ROUTES, controller);
                            const basePath = Reflect.getMetadata(controller_1.ControllerMetadata.BASEPATH, controller);
                            const homePath = Reflect.getMetadata(controller_1.ControllerMetadata.HOMEPATH, controller);
                            if (Reflect.hasMetadata('middleware', controller)) {
                                const ownMiddleware = Reflect.getOwnMetadata('middleware', controller);
                                const middleware = Reflect.getMetadata('middleware', controller);
                                if (!ownMiddleware || ownMiddleware !== middleware) {
                                    const customMiddleware = [];
                                    middleware
                                        .filter((v) => {
                                        if (v.type === middlewareHandle_1.DefaultMiddleWareType.CUSTOM) {
                                            customMiddleware.push(v.fn);
                                            return false;
                                        }
                                        return true;
                                    })
                                        .forEach((v) => {
                                        const target = (0, middlewareHandle_1.findFatherClass)(controller, (i) => {
                                            return i === v.target;
                                        });
                                        if (target) {
                                            const basePath = Reflect.getMetadata(controller_1.ControllerMetadata.BASEPATH, target);
                                            const homePath = Reflect.getMetadata(controller_1.ControllerMetadata.HOMEPATH, target);
                                            const realPath = path_1.default.posix.join(homePath, basePath ?? '');
                                            Reflect.deleteMetadata('middleware', target);
                                            route.use(realPath, v.fn);
                                        }
                                        else {
                                            throw new Error('unkonw Error');
                                        }
                                    });
                                    customMiddleware.length &&
                                        route.use(path_1.default.posix.join(homePath, basePath ?? ''), ...customMiddleware);
                                }
                                else {
                                    route.use(path_1.default.posix.join(homePath, basePath ?? ''), ...(Reflect.getOwnMetadata('middleware', controller) ??
                                        []).map((v) => v.fn));
                                }
                            }
                            if (isController && hasHomePath && (hasRoutes || hasStaticRoutes)) {
                                const routes = [
                                    ...(Reflect.getOwnMetadata(controller_1.ControllerMetadata.ROUTES, controller.prototype) ?? []),
                                    ...(Reflect.getOwnMetadata(controller_1.ControllerMetadata.ROUTES, controller) ?? [])
                                ];
                                routes.forEach((v) => {
                                    const curPath = path_1.default.posix
                                        .join(homePath, basePath, v.path)
                                        .replace(new RegExp('/$'), '');
                                    const controllerInstance = new controller();
                                    const callback = controllerInstance[v.propertyKey].bind(controllerInstance);
                                    route[v.method](curPath, ...(v.middleWare ?? []), callback);
                                });
                            }
                            i++;
                            if (i === moduleArr.length) {
                                resolve(true);
                            }
                        });
                    }
                    else {
                        i++;
                        if (i === moduleArr.length) {
                            resolve(true);
                        }
                    }
                });
            });
        }
        catch (error) {
            reject(dirPath + ' does not exist');
        }
    });
};
exports.scanController = scanController;
//# sourceMappingURL=routes.js.map