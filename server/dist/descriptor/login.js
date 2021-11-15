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
const user_1 = __importDefault(require("@src/models/user"));
const _util_1 = __importStar(require("@util"));
const middlewareHandle_1 = require("./middlewareHandle");
const loginHandle = async (req, res, next) => {
    try {
        await user_1.default.validateToken(req);
        next();
    }
    catch (e) {
        res.error(e.message);
        res.redirect('/login');
    }
};
const Login = (target, propertyKey, descriptor) => {
    _util_1.default.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
        if (result === _util_1.DescriptorKey.CLASS) {
            (0, middlewareHandle_1.classLogHandler)(target, middlewareHandle_1.DefaultMiddleWareType.LOGIN, loginHandle);
        }
        else {
            (0, middlewareHandle_1.methodLogHandler)(target, propertyKey, middlewareHandle_1.DefaultMiddleWareType.LOGIN, loginHandle);
        }
    });
};
exports.default = Login;
//# sourceMappingURL=login.js.map