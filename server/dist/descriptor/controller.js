"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = exports.Delete = exports.Put = exports.Post = exports.Get = exports.ControllerMetadata = exports.RouteMethod = void 0;
const server_config_1 = require("@src/config/server_config");
const httpError_1 = __importDefault(require("@src/models/httpError"));
require("reflect-metadata");
var RouteMethod;
(function (RouteMethod) {
    RouteMethod["GET"] = "get";
    RouteMethod["POST"] = "post";
    RouteMethod["PUT"] = "put";
    RouteMethod["DELETE"] = "delete";
})(RouteMethod = exports.RouteMethod || (exports.RouteMethod = {}));
var ControllerMetadata;
(function (ControllerMetadata) {
    ControllerMetadata["BASEPATH"] = "basePath";
    ControllerMetadata["ROUTES"] = "routes";
    ControllerMetadata["HOMEPATH"] = "homePath";
})(ControllerMetadata = exports.ControllerMetadata || (exports.ControllerMetadata = {}));
function createRouterDecorator(method) {
    return (path) => (target, propertyKey, _descriptor) => {
        process.nextTick(() => {
            const route = {
                propertyKey,
                method,
                path: path || ''
            };
            let constructor;
            if (propertyKey in target) {
                constructor = target;
            }
            else if (propertyKey in target.prototype) {
                constructor = target.prototype;
            }
            else {
                throw new httpError_1.default(server_config_1.Status.SERVER_ERROR, propertyKey.toString() + 'does not in ' + target);
            }
            if (!Reflect.hasMetadata(ControllerMetadata.ROUTES, constructor)) {
                Reflect.defineMetadata(ControllerMetadata.ROUTES, [], constructor);
            }
            const routes = Reflect.getMetadata(ControllerMetadata.ROUTES, constructor);
            routes.push(route);
        });
    };
}
exports.Get = createRouterDecorator(RouteMethod.GET);
exports.Post = createRouterDecorator(RouteMethod.POST);
exports.Put = createRouterDecorator(RouteMethod.PUT);
exports.Delete = createRouterDecorator(RouteMethod.DELETE);
const Controller = (path, homePath = false) => (target) => {
    if (homePath) {
        Reflect.defineMetadata(ControllerMetadata.HOMEPATH, path, target);
    }
    else {
        Reflect.defineMetadata(ControllerMetadata.BASEPATH, path, target);
    }
};
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map