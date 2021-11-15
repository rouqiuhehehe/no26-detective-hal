"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorLoger_1 = __importDefault(require("./errorLoger"));
const dirPath = process.cwd() + '/log/error';
function serverError(err) {
    (0, errorLoger_1.default)(dirPath, err);
}
exports.default = serverError;
//# sourceMappingURL=serverError.js.map