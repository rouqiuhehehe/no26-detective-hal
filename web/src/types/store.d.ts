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

export interface AxiosError<T extends Record<string, any>> {
    status: number;
    success: false;
    data?: T;
    message: string;
}

export type MutationsFunction = <T>(arg?: T) => void;

export interface Check {
    (rule: { field: string; fullField: string; type: string }, value: string, callback: (sub?: Error) => void): void;
}
