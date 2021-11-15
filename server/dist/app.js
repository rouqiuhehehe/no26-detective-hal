"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
require("module-alias");
const posix_1 = __importDefault(require("path/posix"));
require("reflect-metadata");
require("./child_process");
fs_1.default.readFile(posix_1.default.join(__dirname, './server.ts'), (err, data) => {
    if (err) {
        throw err;
    }
    console.log(data.toString());
});
console.log(process.pid);
//# sourceMappingURL=app.js.map