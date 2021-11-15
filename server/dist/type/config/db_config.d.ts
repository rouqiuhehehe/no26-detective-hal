declare const enum dbConfig {
    HOST = "localhost",
    USER = "root",
    PASSWORD = "jianv4as",
    DATABASE = "Node_Learning",
    MULTIPLESTATEMENTS = "true"
}
declare const enum dbPoolConfig {
    CONNECTIONLIMIT = 100
}
declare const _default: {
    host: dbConfig;
    user: dbConfig;
    password: dbConfig;
    database: dbConfig;
    multiplestatements: dbConfig;
    connectionLimit: dbPoolConfig;
};
export default _default;
