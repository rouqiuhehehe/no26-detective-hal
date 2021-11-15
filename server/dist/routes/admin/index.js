"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_1 = __importDefault(require("@src/descriptor/autobind"));
const controller_1 = require("@src/descriptor/controller");
const log_1 = __importDefault(require("@src/descriptor/log"));
let default_1 = class {
};
default_1 = __decorate([
    autobind_1.default,
    (0, log_1.default)(),
    (0, controller_1.Controller)('/admin', true)
], default_1);
exports.default = default_1;
//# sourceMappingURL=index.js.map