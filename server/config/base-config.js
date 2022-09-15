module.exports = {
    // 是否需要sign签名验证
    encrypt: true,
    // 是否需要验证防重放参数
    antiReplay: true,
    // 是否需要验证时间戳
    timestamp: true,
    // 是否需要打印sql语句
    debugSQL: true,
    // 是否需要验证登录
    auth: true,
    // 进程数
    processLen: 1,
    // 当前服务地址
    HTTP_URL_HOST: 'http://127.0.0.1:1337',
    redis: {
        port: 6379,
        host: '127.0.0.1',
        // 路由过期事件，1小时
        WEB_ROUTES_EXPIRE: 3600,
        // token过期时间
        TOKEN_EXPIRED: 14400,
        // token密钥
        TOKEN_SECRET: 'W18hBlQ$J_)HqSd'
    }
};
