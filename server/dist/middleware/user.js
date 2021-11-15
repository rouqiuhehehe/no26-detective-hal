"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_config_1 = require("@src/config/server_config");
const httpError_1 = __importDefault(require("@src/models/httpError"));
const user_1 = __importDefault(require("@src/models/user"));
exports.default = async (req, res, next) => {
    const { uid } = req.session;
    if (!uid) {
        next();
    }
    else {
        try {
            const user = await user_1.default.getById(uid);
            req.user = res.locals.user = user.userInfo;
            next();
        }
        catch (e) {
            next(new httpError_1.default(server_config_1.Status.SERVER_ERROR, e.message ?? e));
        }
    }
};
//# sourceMappingURL=user.js.map