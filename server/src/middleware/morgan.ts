import autoBind from '@src/descriptor/autobind';
import Util from '@util';
import { Request, Response } from 'express';
import FileStreamRotator from 'file-stream-rotator';
import morgan from 'morgan';
import path from 'path';
@autoBind
export default class Morgan {
    public constructor(private dirPath: string) {}

    public useLogger() {
        const key = this.morganforMat();

        return morgan(key, {
            stream: this.fileStreamRotatorGetStream()
        });
    }

    private morganforMat() {
        const key = 'dev_params';

        morgan.token('localDate', () => {
            return `[${Util.dateFormat(new Date(), 'yyyy-MM-dd HH.mm.ss')}]`;
        });

        morgan.token('requestHeaders', (req: Request, _res: Response) => {
            return 'headers: ' + JSON.stringify(req.headers) || '-';
        });

        morgan.token('requestRouteParameters', (req: Request, _res: Response) => {
            return 'params: ' + JSON.stringify(req.params) || '-';
        });

        morgan.token('requestParameters', (req: Request, _res: Response) => {
            return 'query: ' + JSON.stringify(req.query) || '-';
        });

        morgan.token('requestBody', (req: Request, _res: Response) => {
            return 'body: ' + JSON.stringify(req.body) || '-';
        });

        morgan.format(
            key,
            `:localDate \n:requestHeaders \n:method :url :status \n:requestRouteParameters :requestParameters :requestBody \n`
        );

        return key;
    }

    private fileStreamRotatorGetStream() {
        return FileStreamRotator.getStream({
            date_format: 'YYYYMMDD',
            filename: path.join(this.dirPath, 'access-%DATE%.log'),
            frequency: 'daily',
            verbose: false,
            max_logs: '10d'
        });
    }
}
