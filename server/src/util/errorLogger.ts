import HttpError from '@src/models/httpError';
import Util from '@util';
import FileStreamRotator from 'file-stream-rotator';
import path from 'path';

const defaultPath = path.join(process.cwd(), 'log', 'error');
export default function errorLogger<T extends Error>(
    err: HttpError<T> | T,
    req?: ExpressRequest | null,
    dirPath?: string,
    cb?: () => void
) {
    const stream = FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: path.join(dirPath ?? defaultPath, 'access-%DATE%.log'),
        frequency: 'daily',
        verbose: false,
        max_logs: '10d'
    });

    stream.write(
        req
            ? `\n[${Util.dateFormat(new Date(), 'yyyy-MM-dd HH.mm.ss')}]\n${req.url}\n headers:${JSON.stringify(
                  req.headers
              )}\n params:${JSON.stringify(req.params)}\n query:${JSON.stringify(req.query)}\n body:${JSON.stringify(
                  req.body
              )}\n${Util.isExtendsHttpError(err) ? err.err?.stack ?? err.stack : err} \n\n`
            : `\n[${Util.dateFormat(new Date(), 'yyyy-MM-dd HH.mm.ss')}]\n${err.stack ?? err}\n\n`,
        'utf-8',
        (err) => {
            if (err) {
                console.error(err);
            }
        }
    );

    stream.end(() => {
        cb && cb();
    });
}
