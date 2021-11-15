"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("@src/bin/redis"));
const jwt_1 = require("@src/config/jwt");
const server_config_1 = require("@src/config/server_config");
const user_error_1 = require("@src/config/user_error");
const bcrypt_1 = __importDefault(require("bcrypt"));
const httpError_1 = __importDefault(require("./httpError"));
const jwt_2 = require("./jwt");
class User {
    static getByUsername(name) {
        return new Promise(async (resolve, reject) => {
            try {
                const id = await User.getId(name);
                if (id) {
                    const user = await User.getById(id);
                    resolve(user);
                }
                else {
                    resolve(null);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    static authenticate(userInfo) {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUserInfo = await User.getByUsername(userInfo.username);
                if (dbUserInfo) {
                    const bcryptPassword = await bcrypt_1.default.hash(userInfo.password, dbUserInfo.userInfo.salt);
                    if (bcryptPassword === dbUserInfo.userInfo.password) {
                        resolve(dbUserInfo.userInfo.id);
                    }
                    else {
                        reject(user_error_1.LoginError.PASSWORD_ERROR);
                    }
                }
                else {
                    reject(user_error_1.LoginError.USERNAME_ERROR);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    static getById(id) {
        return new Promise((resolve, reject) => {
            redis_1.default.hgetall('user:' + id, (err, userInfo) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new User(userInfo));
                }
            });
        });
    }
    static issueToken(id) {
        return new Promise((resolve, reject) => {
            redis_1.default.hgetall('user:' + id, (err, userInfo) => {
                if (err) {
                    reject(err);
                }
                else {
                    const info = userInfo;
                    info.secret = jwt_1.Jwt_Config.SECRET + Math.random();
                    info.token = jwt_2.Jwt.issueToken(info.username, info.secret);
                    redis_1.default.hmset('user:' + id, info, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(info.token);
                        }
                    });
                }
            });
        });
    }
    static validateToken(req) {
        return new Promise((resolve, reject) => {
            let token;
            if (process.env.NODE_ENV === 'development') {
                if (!req.session.uid || !req.signedCookies.uid) {
                    reject(new httpError_1.default(server_config_1.Status.SERVER_ERROR, user_error_1.Issue.TOKEN_IS_NOT_FIND));
                }
                token =
                    req.session.authorization?.replace('Bearer ', '') ??
                        req.signedCookies.authorization?.replace('Bearer ', '');
            }
            else {
                if (!req.session.uid) {
                    reject(new httpError_1.default(server_config_1.Status.SERVER_ERROR, user_error_1.Issue.TOKEN_IS_NOT_FIND));
                }
                token = req.session.authorization?.replace('Bearer ', '');
            }
            if (!token) {
                reject(new httpError_1.default(server_config_1.Status.SERVER_ERROR, user_error_1.Issue.TOKEN_IS_NOT_FIND));
            }
            else {
                const id = req.session.uid;
                redis_1.default.hgetall('user:' + id, async (err, userInfo) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const info = userInfo;
                        if (info && info.token === token) {
                            try {
                                const decoded = await jwt_2.Jwt.vailToken(token, info.secret);
                                resolve(decoded);
                            }
                            catch (e) {
                                reject(new httpError_1.default(server_config_1.Status.SERVER_ERROR, e.message, e));
                            }
                        }
                        else {
                            reject(new httpError_1.default(server_config_1.Status.SERVER_ERROR, user_error_1.Issue.TOKEN_IS_ERROR));
                        }
                    }
                });
            }
        });
    }
    static getId(name) {
        return new Promise((resolve, reject) => {
            redis_1.default.get('user:id:' + name, (err, id) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (id) {
                        resolve(+id);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
    userInfo;
    incrKey = 'user:ids';
    updateSetKey = '';
    updateHashSetKey = '';
    SALT_BASE = 12;
    constructor(userInfo) {
        this.userInfo = userInfo;
        this.updateSetKey = 'user:id:' + this.userInfo.username;
    }
    save() {
        return new Promise(async (resolve, reject) => {
            if (this.userInfo.id) {
                await this.update();
                resolve(this.userInfo.id);
            }
            else {
                try {
                    redis_1.default.incr(this.incrKey, async (err, id) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            const hash = await this.hashPassword();
                            this.userInfo.password = hash.hashPassword;
                            this.userInfo.salt = hash.salt;
                            this.userInfo.id = id;
                            this.updateHashSetKey = 'user:' + id;
                            await this.update();
                            resolve(id);
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            }
        });
    }
    toJSON() {
        return {
            id: this.userInfo.id,
            username: this.userInfo.username
        };
    }
    update() {
        return new Promise((resolve, reject) => {
            if (this.userInfo.id) {
                redis_1.default.set(this.updateSetKey, this.userInfo.id.toString(), (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        redis_1.default.hmset(this.updateHashSetKey, this.userInfo, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                });
            }
        });
    }
    hashPassword() {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = await bcrypt_1.default.genSalt(this.SALT_BASE);
                const hashPassword = await bcrypt_1.default.hash(this.userInfo.password, salt);
                resolve({
                    hashPassword,
                    salt
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map