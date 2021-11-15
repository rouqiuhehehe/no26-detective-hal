"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.Listen = void 0;
var Listen;
(function (Listen) {
    Listen[Listen["PORT"] = 8000] = "PORT";
    Listen[Listen["TCP_SOCKET_PORT"] = 8888] = "TCP_SOCKET_PORT";
    Listen[Listen["UDP_SOCKET_PORT"] = 41234] = "UDP_SOCKET_PORT";
    Listen[Listen["WEB_SOCKET_PORT"] = 12310] = "WEB_SOCKET_PORT";
    Listen[Listen["TLS_SOCKET_PORT"] = 33223] = "TLS_SOCKET_PORT";
    Listen[Listen["HTTPS"] = 8443] = "HTTPS";
})(Listen = exports.Listen || (exports.Listen = {}));
var Status;
(function (Status) {
    Status[Status["SUCCESS"] = 200] = "SUCCESS";
    Status[Status["USE_LAST_RESOURCE"] = 304] = "USE_LAST_RESOURCE";
    Status[Status["REJECT_REQUEST"] = 403] = "REJECT_REQUEST";
    Status[Status["SERVER_NOT_FOUNT"] = 404] = "SERVER_NOT_FOUNT";
    Status[Status["SERVER_ERROR"] = 500] = "SERVER_ERROR";
    Status[Status["UNKONW_ERROR"] = 1001] = "UNKONW_ERROR";
})(Status = exports.Status || (exports.Status = {}));
//# sourceMappingURL=server_config.js.map