"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_config_1 = require("@src/config/server_config");
class HttpError extends Error {
    status;
    message;
    err;
    success = false;
    constructor(status = server_config_1.Status.SERVER_ERROR, message = 'unkonw error', err) {
        super(message);
        this.status = status;
        this.message = message;
        this.err = err;
    }
}
exports.default = HttpError;
//# sourceMappingURL=httpError.js.map