import Util from '@util';
import FileStreamRotator from 'file-stream-rotator';
import path from 'path';

export default function errorLoger<T extends Error>(dirPath: string, req: ExpressRequest | null, err: T) {
    const stream = FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: path.join(dirPath, 'access-%DATE%.log'),
        frequency: 'daily',
        verbose: false,
        max_logs: '10d'
    });

    stream.write(
        req
            ? `\n[${Util.dateFormat(new Date(), 'yyyy-MM-dd HH.mm.ss')}]\n${req.url}\nheaders:${JSON.stringify(
                  req.headers
              )}\nparams:${JSON.stringify(req.params)}\nquery:${JSON.stringify(req.query)}\nbody:${JSON.stringify(
                  req.body
              )}\n${err.stack ?? err} \n\n`
            : err.stack ?? err,
        'utf-8',
        (err) => {
            if (err) {
                console.error(err);
            }
        }
    );

    stream.end();
}
