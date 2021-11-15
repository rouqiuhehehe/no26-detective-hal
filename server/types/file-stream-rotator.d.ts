declare module 'file-stream-rotator' {
    import { WriteStream } from 'fs';

    interface Options {
        /**  日志文件按小时记录 */
        date_format?: string; // 日志文件按小时记录
        filename?: string;
        frequency?: 'daily' | 'custom' | 'test';
        verbose?: boolean;
        max_logs?: number | string;
    }

    export function getStream(opt: Options): WriteStream;
}

declare module 'easy-monitor' {
    function e(name: string): Promise<any>;

    export = e;
}
