"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodMiddleware = exports.methodLogHandler = exports.classLogHandler = exports.findFatherClass = exports.DefaultMiddleWareType = void 0;
const server_config_1 = require("@src/config/server_config");
const httpError_1 = __importDefault(require("@src/models/httpError"));
const controller_1 = require("./controller");
const repeatDefineError = new httpError_1.default(server_config_1.Status.SERVER_ERROR, '父路由定义过的中间件不允许在子路由重复定义');
var DefaultMiddleWareType;
(function (DefaultMiddleWareType) {
    DefaultMiddleWareType["LOG"] = "log";
    DefaultMiddleWareType["LOGIN"] = "login";
    DefaultMiddleWareType["CUSTOM"] = "custom";
})(DefaultMiddleWareType = exports.DefaultMiddleWareType || (exports.DefaultMiddleWareType = {}));
const findFatherClass = (target, cb) => {
    const father = Object.getPrototypeOf(target);
    if (father) {
        if (cb(father)) {
            return father;
        }
        else {
            (0, exports.findFatherClass)(father, cb);
        }
    }
    else {
        return false;
    }
};
exports.findFatherClass = findFatherClass;
const classLogHandler = (target, type, middleware) => {
    if (Reflect.hasMetadata('middleware', target)) {
        const middleware = Reflect.getMetadata('middleware', target);
        if (!Reflect.hasOwnMetadata('middleware', target)) {
            if (middleware.some((v) => v.type === type)) {
                throw repeatDefineError;
            }
            Reflect.defineMetadata('middleware', [], target);
        }
        else {
            const father = (0, exports.findFatherClass)(target, (v) => {
                const middleware = Reflect.getOwnMetadata('middleware', v);
                return middleware && middleware.some((i) => i.type === type);
            });
            if (father) {
                throw repeatDefineError;
            }
        }
    }
    else {
        Reflect.defineMetadata('middleware', [], target);
    }
    Reflect.getOwnMetadata('middleware', target).push({
        type,
        target,
        fn: middleware
    });
};
exports.classLogHandler = classLogHandler;
const methodLogHandler = (target, propertyKey, type, middleware) => {
    const routes = Reflect.getMetadata(controller_1.ControllerMetadata.ROUTES, target);
    if (routes instanceof Array && routes.length) {
        if (Reflect.hasMetadata('middleware', target.constructor)) {
            const middleware = Reflect.getMetadata('middleware', target.constructor);
            if (!Reflect.hasOwnMetadata('middleware', target, propertyKey)) {
                if (middleware.some((v) => v.type === type)) {
                    throw repeatDefineError;
                }
            }
            else {
                const father = (0, exports.findFatherClass)(target, (v) => {
                    const middleware = Reflect.getOwnMetadata('middleware', v);
                    return middleware && middleware.some((i) => i.type === type);
                });
                if (father) {
                    throw repeatDefineError;
                }
            }
        }
        const route = routes.find((v) => v.propertyKey === propertyKey);
        if (route) {
            (route.middleWare ?? (route.middleWare = [])).push(middleware);
        }
        else {
            throw new RangeError('The route defined by the current middleware was not found');
        }
    }
    else {
        throw new httpError_1.default(server_config_1.Status.SERVER_ERROR, routes + ' is not an array, is maybe that the descriptor in the wrong order');
    }
};
exports.methodLogHandler = methodLogHandler;
const methodMiddleware = (target, propertyKey, middleware) => {
    process.nextTick(() => {
        const routes = Reflect.getMetadata(controller_1.ControllerMetadata.ROUTES, target);
        if (routes instanceof Array && routes.length) {
            const route = routes.find((v) => v.propertyKey === propertyKey);
            if (route) {
                (route.middleWare ?? (route.middleWare = [])).push(middleware(route.method));
            }
            else {
                throw new RangeError('The route defined by the current middleware was not found');
            }
        }
        else {
            throw new httpError_1.default(server_config_1.Status.SERVER_ERROR, routes + ' is not an array, is maybe that the descriptor in the wrong order');
        }
    });
};
exports.methodMiddleware = methodMiddleware;
//# sourceMappingURL=middlewareHandle.js.map