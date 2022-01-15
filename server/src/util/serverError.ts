import errorLogger from './errorLogger';

export default function serverError<T extends Error>(err: T) {
    errorLogger(err);
}
