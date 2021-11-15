"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptorType = exports.DescriptorKey = void 0;
const error_1 = require("@src/config/error");
const controller_1 = require("@src/descriptor/controller");
const httpError_1 = __importDefault(require("@src/models/httpError"));
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const path_1 = __importDefault(require("path"));
const server_config_1 = require("../config/server_config");
const variable_type_1 = __importDefault(require("./variable_type"));
var DescriptorKey;
(function (DescriptorKey) {
    DescriptorKey["CLASS"] = "classDescriptor";
    DescriptorKey["METHOD"] = "methodDescriptor";
})(DescriptorKey = exports.DescriptorKey || (exports.DescriptorKey = {}));
var DescriptorType;
(function (DescriptorType) {
    DescriptorType["DATA"] = "data";
    DescriptorType["ACCESSOR"] = "accessor";
    DescriptorType["UNDEFINED"] = "undefined";
})(DescriptorType = exports.DescriptorType || (exports.DescriptorType = {}));
const channel = new events_1.default.EventEmitter();
class Util {
    static channel = channel;
    static variableTypes = variable_type_1.default;
    static hadError(err, res) {
        if (process.env.NODE_ENV === 'development') {
            if (res) {
                res.status(err.status).send({
                    status: err.status,
                    success: false,
                    message: err.message
                });
            }
            else {
                throw new Error(err.message);
            }
        }
        else {
            if (res) {
                res.status(err.status).send({
                    status: err.status,
                    success: false,
                    message: error_1.ErrorMsg.SERVER_ERROR
                });
            }
            else {
                console.log('err', err.message);
            }
        }
    }
    static middlewareDescriptor(target, propertyKey, descriptor, fn) {
        if (propertyKey && descriptor && fn) {
            process.nextTick(() => {
                const hasRoutes = Reflect.hasMetadata(controller_1.ControllerMetadata.ROUTES, target);
                if (hasRoutes) {
                    fn(DescriptorKey.METHOD);
                }
                else {
                    throw new httpError_1.default(server_config_1.Status.SERVER_ERROR, 'routes is undefined, is maybe that the descriptor in the wrong order');
                }
            });
        }
        else {
            const hasHomePath = Reflect.hasMetadata(controller_1.ControllerMetadata.HOMEPATH, target);
            if (hasHomePath) {
                fn(DescriptorKey.CLASS);
            }
            else {
                throw new httpError_1.default(server_config_1.Status.SERVER_ERROR, target.name + ' does not has homePath');
            }
        }
    }
    static dateFormat(dft, format) {
        const dateObj = new Date(dft);
        let k;
        const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        let _format = format;
        const o = {
            'M+': dateObj.getMonth() + 1,
            'd+': dateObj.getDate(),
            'h+': dateObj.getHours() % 12,
            'H+': dateObj.getHours(),
            'm+': dateObj.getMinutes(),
            's+': dateObj.getSeconds(),
            'q+': Math.floor((dateObj.getMonth() + 3) / 3),
            'S+': dateObj.getMilliseconds(),
            'W+': week[dateObj.getDay()]
        };
        if (/(y+)/.test(_format)) {
            _format = _format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (k in o) {
            if (new RegExp('(' + k + ')').test(_format)) {
                _format = _format.replace(RegExp.$1, RegExp.$1.length === 1 ? `${o[k]}` : ('00' + o[k]).substr(('' + o[k]).length));
            }
        }
        if (!dft) {
            return '';
        }
        return _format;
    }
    static getCmdParams() {
        const params = process.argv.splice(2);
        const paramsObj = {};
        for (const item of params) {
            const format = item.slice(2);
            const paramsArr = format.split('=');
            paramsObj[paramsArr[0]] = paramsArr[1];
        }
        return paramsObj;
    }
    static sleep(time) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        });
    }
    static readFile(fileName, fn, encoding = 'utf-8') {
        fs_1.default.readFile(path_1.default.join(__dirname, '../', fileName), encoding, (err, data) => {
            if (err) {
                Util.hadError(new httpError_1.default(server_config_1.Status.SERVER_ERROR, err.message, err));
            }
            else {
                fn.call(null, data);
            }
        });
    }
    static getNoParamsUrl(req) {
        const urlObj = new URL(req.url, 'http:localhost:' + server_config_1.Listen.PORT);
        return urlObj.pathname;
    }
    static getFunctionTypeByDescriptor(descriptor) {
        if (Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
            return DescriptorType.DATA;
        }
        else if (Object.prototype.hasOwnProperty.call(descriptor, 'get') ||
            Object.prototype.hasOwnProperty.call(descriptor, 'set')) {
            return DescriptorType.ACCESSOR;
        }
        else {
            return DescriptorType.UNDEFINED;
        }
    }
    static getFunctionByDescriptor(descriptor) {
        const fnType = Util.getFunctionTypeByDescriptor(descriptor);
        let type;
        let fn;
        switch (fnType) {
            case DescriptorType.DATA:
                if (typeof descriptor.value !== 'function') {
                    throw new TypeError(descriptor.value + ' is not a function');
                }
                type = DescriptorType.DATA;
                fn = descriptor.value;
                break;
            case DescriptorType.ACCESSOR:
                if (typeof descriptor.set !== 'function') {
                    throw new TypeError(descriptor.set.name + ' is not a function');
                }
                if (typeof descriptor.get !== 'function') {
                    throw new TypeError(descriptor.get.name + ' is not a function');
                }
                type = DescriptorType.ACCESSOR;
                fn = {
                    get: descriptor.get,
                    set: descriptor.set
                };
                break;
            case DescriptorType.UNDEFINED:
                return {
                    type: DescriptorType.UNDEFINED,
                    fn: DescriptorType.UNDEFINED
                };
        }
        return {
            type,
            fn
        };
    }
    static dataByReadStream(path, option, encoding = 'utf8') {
        const rs = fs_1.default.createReadStream(path, option ?? {
            highWaterMark: 3
        });
        return new Promise((resolve, reject) => {
            const res = [];
            rs.on('data', (chunk) => {
                res.push(chunk);
            });
            rs.on('end', () => {
                const buf = Buffer.concat(res);
                const str = iconv_lite_1.default.decode(buf, encoding);
                resolve(str);
            });
            rs.on('error', (err) => {
                reject(err);
            });
        });
    }
    static successSend(data) {
        return {
            status: server_config_1.Status.SUCCESS,
            data,
            success: true
        };
    }
    static errorSend(err) {
        return {
            status: server_config_1.Status.SERVER_ERROR,
            success: false,
            message: err.message
        };
    }
    static isExtendsHttpError(err) {
        if (err instanceof httpError_1.default) {
            return true;
        }
        return false;
    }
}
exports.default = Util;
//# sourceMappingURL=index.js.map