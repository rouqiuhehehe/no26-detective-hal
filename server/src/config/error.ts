export enum ErrorMsg {
    AFFECTEDROWS_ERROR = 'An unknown error occurred and the deletion failed. It may be that this id is error or the data cannot be found',
    UNKONW_ERROR = 'An unkown error',
    SERVER_ERROR = 'server error',
    MISSING_PARAMS = '参数缺失',
    MISSING_REPLAY_PARAMS = '请设置防重放参数',
    ERROR_REPLAY_PARAMS = '防重放参数错误',
    HASH_ERROR = '哈希参数校验失败',
    PASSWORD_SALT_ERROR = '密码加密错误',
    TIMESTAMP_ERRPR = '时间戳参数过期',
    VERIFY_CODE_ERROR = '验证码验证失败'
}
