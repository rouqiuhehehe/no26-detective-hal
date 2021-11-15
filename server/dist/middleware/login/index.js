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
const joi_1 = __importDefault(require("joi"));
let LoginMiddware = class LoginMiddware {
    loginUserCheck(req, res, next) {
        const schema = joi_1.default.object({
            username: joi_1.default.string().required().min(4).max(20),
            password: joi_1.default.string().required().min(6).max(16)
        });
        const { error } = schema.validate(req.body);
        if (error) {
            res.error(error.message);
            res.redirect('back');
        }
        else {
            next();
        }
    }
    addUserMiddleware(req, res, next) {
        const schema = joi_1.default.object({
            username: joi_1.default.string().required().min(4).max(20),
            password: joi_1.default.string().required().min(6).max(16)
        });
        const { error } = schema.validate(req.body);
        if (error) {
            res.error(error.message);
            res.redirect('back');
        }
        else {
            next();
        }
    }
};
LoginMiddware = __decorate([
    autobind_1.default
], LoginMiddware);
exports.default = new LoginMiddware();
//# sourceMappingURL=index.js.map