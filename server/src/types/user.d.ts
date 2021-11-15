export interface UserInfo extends Record<string, undefined | string | number> {
    username: string;
    password: string;
    id?: number;
    salt?: string;
    secret?: string;
    token?: string;
}

export interface HashPasswordAndSalt {
    hashPassword: string;
    salt: string;
}

export type ParamsUserInfo = Pick<UserInfo, 'username' | 'password'>;
