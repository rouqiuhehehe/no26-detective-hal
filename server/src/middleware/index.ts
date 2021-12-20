import NotFound from './404';
import ErrorMiddleware from './errorMiddleware';
import ResSendHandle from './res-send-handle';

class Middleware {
    // public errorMiddleware = errorMiddleware;

    public constructor(
        public resSendHandle = ResSendHandle,
        public errorMiddleware = ErrorMiddleware,
        public notFound = NotFound.redirect
    ) {}
}

export default new Middleware();
