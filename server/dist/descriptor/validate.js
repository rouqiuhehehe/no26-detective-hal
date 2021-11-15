"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_config_1 = require("@src/config/server_config");
const httpError_1 = __importDefault(require("@src/models/httpError"));
const joi_1 = __importDefault(require("joi"));
const middlewareHandle_1 = require("./middlewareHandle");
const callback = (params, errcb) => (method) => (req, res, next) => {
    const schema = joi_1.default.object(params);
    const { error } = schema.validate(method === 'get' ? req.query : req.body);
    if (error) {
        if (errcb) {
            if (typeof errcb === 'function') {
                errcb(error);
            }
            else if (errcb === 'redirect') {
                res.error(error.message);
                res.redirect('back');
            }
        }
        else {
            next(new httpError_1.default(server_config_1.Status.SERVER_ERROR, error.message));
        }
    }
    else {
        next();
    }
};
function Validate(...arr) {
    return (target, name, _descriptor) => {
        (0, middlewareHandle_1.methodMiddleware)(target, name, callback(...arr));
    };
}
exports.default = Validate;
//# sourceMappingURL=validate.js.map