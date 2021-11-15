"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Issue = exports.LoginError = exports.RegisterError = void 0;
var RegisterError;
(function (RegisterError) {
    RegisterError["NOT_FIND"] = "user is not find";
    RegisterError["USERNAME_WAS_USED"] = "username was be used";
})(RegisterError = exports.RegisterError || (exports.RegisterError = {}));
var LoginError;
(function (LoginError) {
    LoginError["PASSWORD_ERROR"] = "password is error";
    LoginError["USERNAME_ERROR"] = "username is not find";
})(LoginError = exports.LoginError || (exports.LoginError = {}));
var Issue;
(function (Issue) {
    Issue["TOKEN_IS_NOT_FIND"] = "token is require";
    Issue["TOKEN_IS_ERROR"] = "token is error";
})(Issue = exports.Issue || (exports.Issue = {}));
//# sourceMappingURL=user_error.js.map