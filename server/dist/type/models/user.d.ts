import { ParamsUserInfo, UserInfo } from '@src/types/user';
import { Request } from 'express';
export default class User {
    static getByUsername(name: string): Promise<User | null>;
    static authenticate(userInfo: ParamsUserInfo): Promise<number>;
    static getById(id: number): Promise<User>;
    static issueToken(id: number): Promise<unknown>;
    static validateToken(req: Request): Promise<unknown>;
    private static getId;
    userInfo: UserInfo;
    private incrKey;
    private updateSetKey;
    private updateHashSetKey;
    private SALT_BASE;
    constructor(userInfo: ParamsUserInfo);
    save(): Promise<number>;
    toJSON(): {
        id: number | undefined;
        username: string;
    };
    private update;
    private hashPassword;
}
