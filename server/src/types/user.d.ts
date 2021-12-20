export interface UserInfo extends Record<string, string> {
    username: string;
    uid: string;
    secret: string;
    token: string;
}

export interface HashPasswordAndSalt {
    hashPassword: string;
    salt: string;
}

export interface ParamsUserInfo {
    username: string;
    password: string;
    salt: string;
}
