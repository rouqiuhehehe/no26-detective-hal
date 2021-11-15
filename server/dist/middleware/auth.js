"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("@src/models/user"));
const _util_1 = __importDefault(require("@util"));
class Auth {
    static WHITE_URL = ['/login', '/register', '/favicon.ico', '/404', '/'];
    static async authMiddleware(req, res, next) {
        const pathname = _util_1.default.getNoParamsUrl(req);
        const isContinue = pathname === '/'
            ? Auth.WHITE_URL.includes(pathname)
            : Auth.WHITE_URL.some((v) => new RegExp('^' + v).test(pathname));
        if (isContinue) {
            next();
        }
        else {
            try {
                await user_1.default.validateToken(req);
                next();
            }
            catch (e) {
                res.error(e.message);
                res.redirect('/login');
            }
        }
    }
}
exports.default = Auth;
//# sourceMappingURL=auth.js.map