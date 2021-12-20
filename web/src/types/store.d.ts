export interface Staties {
    fromName: string;
    toName: string;
    success: boolean;
    path: string;
}

export interface AxiosRes<T extends Record<string, any>> {
    status: number;
    success: boolean;
    data: T;
}

export type MutationsFunction = <T>(arg?: T) => void;

export interface Check {
    (rule: { field: string; fullField: string; type: string }, value: string, callback: (sub?: Error) => void): void;
}

export interface UserInfo {
    nickname: string;
    avatar: string;
    create_date: string;
    username: string;
}
