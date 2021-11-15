"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("./models/child_process"));
class Cp extends child_process_1.default {
    constructor() {
        super();
    }
}
exports.default = new Cp();
//# sourceMappingURL=child_process.js.map