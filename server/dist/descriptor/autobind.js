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
Object.defineProperty(exports, "__esModule", { value: true });
const _util_1 = __importStar(require("@util"));
function autoBind(target, name, descriptor) {
    if (descriptor !== undefined && name !== undefined) {
        const fn = _util_1.default.getFunctionByDescriptor(descriptor);
        return methodAutoBind(target, name, fn);
    }
    else {
        const prototype = target.prototype;
        const descriptors = Object.getOwnPropertyDescriptors(prototype);
        for (const key in descriptors) {
            if (key !== 'constructor') {
                const fn = _util_1.default.getFunctionByDescriptor(descriptors[key]);
                Object.defineProperty(prototype, key, methodAutoBind(target, key, fn));
            }
        }
    }
}
function methodAutoBind(target, key, fn) {
    let get;
    let set;
    if (fn.type === _util_1.DescriptorType.DATA) {
        get = fn.fn;
    }
    else if (fn.type === _util_1.DescriptorType.ACCESSOR) {
        get = fn.fn.get;
        set = fn.fn.set;
    }
    else {
        throw new TypeError(_util_1.DescriptorType.UNDEFINED + ' is not a function');
    }
    return {
        configurable: true,
        get() {
            if (Object.prototype.hasOwnProperty.call(this, key) || this === target.prototype) {
                return get;
            }
            Object.defineProperty(this, key, {
                get() {
                    return get.bind(this);
                },
                set() {
                    if (set) {
                        return set.bind(this);
                    }
                },
                configurable: true
            });
            return get.bind(this);
        },
        set() {
            if (set) {
                return set.bind(this);
            }
        }
    };
}
exports.default = autoBind;
//# sourceMappingURL=autobind.js.map