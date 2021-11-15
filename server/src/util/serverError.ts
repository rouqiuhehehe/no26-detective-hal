import errorLoger from './errorLoger';

const dirPath = process.cwd() + '/log/error';

export default function serverError<T extends Error>(err: T) {
    errorLoger(dirPath, null, err);
}
