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
const morgan_1 = __importDefault(require("@src/middleware/morgan"));
const _util_1 = __importStar(require("@util"));
const path_1 = __importDefault(require("path"));
const middlewareHandle_1 = require("./middlewareHandle");
const logger = new morgan_1.default(path_1.default.join(__dirname, '../../log/info'));
const loggerMiddleware = logger.useLogger();
function Log(dev) {
    return (target, propertyKey, descriptor) => {
        _util_1.default.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
            if (result === _util_1.DescriptorKey.CLASS) {
                if (dev === 'dev') {
                    if (process.env.NODE_ENV === 'development') {
                        (0, middlewareHandle_1.classLogHandler)(target, middlewareHandle_1.DefaultMiddleWareType.LOG, loggerMiddleware);
                    }
                }
                else {
                    (0, middlewareHandle_1.classLogHandler)(target, middlewareHandle_1.DefaultMiddleWareType.LOG, loggerMiddleware);
                }
            }
            else {
                if (dev === 'dev') {
                    if (process.env.NODE_ENV === 'development') {
                        (0, middlewareHandle_1.methodLogHandler)(target, propertyKey, middlewareHandle_1.DefaultMiddleWareType.LOG, loggerMiddleware);
                    }
                }
                else {
                    (0, middlewareHandle_1.methodLogHandler)(target, propertyKey, middlewareHandle_1.DefaultMiddleWareType.LOG, loggerMiddleware);
                }
            }
        });
    };
}
exports.default = Log;
//# sourceMappingURL=log.js.map