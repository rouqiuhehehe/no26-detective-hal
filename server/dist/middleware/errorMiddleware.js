"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("@src/config/error");
const server_config_1 = require("@src/config/server_config");
const errorLoger_1 = __importDefault(require("@src/util/errorLoger"));
exports.default = (dirPath) => (err, _req, res, _next) => {
    (0, errorLoger_1.default)(dirPath, err);
    if (process.env.NODE_ENV === 'development') {
        return res.status(server_config_1.Status.SUCCESS).send({
            status: err.status,
            success: false,
            message: err.message
        });
    }
    else {
        return res.status(err.status).send(error_1.ErrorMsg.SERVER_ERROR);
    }
};
//# sourceMappingURL=errorMiddleware.js.map