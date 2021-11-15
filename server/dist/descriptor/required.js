"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validate_1 = __importDefault(require("./validate"));
function Required(arr) {
    const stringRegExp = /^\!/;
    const numberRegExp = /^\+/;
    const joiObject = arr.reduce((a, v) => {
        const isString = stringRegExp.test(v);
        const isNumber = numberRegExp.test(v);
        if (v in a) {
            throw new RangeError('Please do not add duplicate verification');
        }
        else {
            if (isString) {
                a[v.slice(1)] = joi_1.default.string().required();
            }
            else if (isNumber) {
                a[v.slice(1)] = joi_1.default.number().required();
            }
            else {
                a[v] = joi_1.default.required();
            }
        }
        return a;
    }, {});
    return (0, validate_1.default)(joiObject);
}
exports.default = Required;
//# sourceMappingURL=required.js.map