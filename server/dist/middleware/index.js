"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _404_1 = __importDefault(require("./404"));
const auth_1 = __importDefault(require("./auth"));
const errorMiddleware_1 = __importDefault(require("./errorMiddleware"));
const message_1 = __importDefault(require("./message"));
const user_1 = __importDefault(require("./user"));
class Middleware {
    errorMiddleware;
    message;
    user;
    auth;
    notFound;
    constructor(errorMiddleware = errorMiddleware_1.default, message = message_1.default.messageMiddleware, user = user_1.default, auth = auth_1.default.authMiddleware, notFound = _404_1.default.redirect) {
        this.errorMiddleware = errorMiddleware;
        this.message = message;
        this.user = user;
        this.auth = auth;
        this.notFound = notFound;
    }
}
exports.default = new Middleware();
//# sourceMappingURL=index.js.map