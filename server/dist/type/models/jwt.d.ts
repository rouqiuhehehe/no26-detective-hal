export declare class Jwt {
    static issueToken(username: string, secret: string): string;
    static vailToken(token: string, secret: string): Promise<unknown>;
}
