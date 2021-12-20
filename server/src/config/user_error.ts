export enum LoginError {
    PASSWORD_ERROR = '密码错误',
    USERNAME_ERROR = '用户名错误'
}

export enum Issue {
    TOKEN_IS_NOT_FIND = '认证失效，请重新登陆',
    TOKEN_IS_ERROR = '认证错误，请重新登陆',
    TOKEN_IS_EXPIRED = '认证过期，请重新登陆'
}
