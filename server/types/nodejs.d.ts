declare module 'process' {
    global {
        namespace NodeJS {
            interface Process {
                emit(event: string, ...params: any[]): void;
            }
        }
    }
}
