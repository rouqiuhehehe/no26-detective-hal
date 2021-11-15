"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dbConfig;
(function (dbConfig) {
    dbConfig["HOST"] = "localhost";
    dbConfig["USER"] = "root";
    dbConfig["PASSWORD"] = "jianv4as";
    dbConfig["DATABASE"] = "Node_Learning";
    dbConfig["MULTIPLESTATEMENTS"] = "true";
})(dbConfig || (dbConfig = {}));
var dbPoolConfig;
(function (dbPoolConfig) {
    dbPoolConfig[dbPoolConfig["CONNECTIONLIMIT"] = 100] = "CONNECTIONLIMIT";
})(dbPoolConfig || (dbPoolConfig = {}));
exports.default = {
    host: "localhost",
    user: "root",
    password: "jianv4as",
    database: "Node_Learning",
    multiplestatements: "true",
    connectionLimit: 100
};
//# sourceMappingURL=db_config.js.map