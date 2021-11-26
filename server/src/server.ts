import { scanController } from '@src/models/routes';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import http from 'http';
import path from 'path';
import { Secret } from './config/secret';
import { Listen } from './config/server_config';
import middleware from './middleware';

export default class App {
    public app: express.Application;

    public constructor() {
        this.app = express();
        this.config();
        this.set();
        this.middleware();
    }

    public initRoute(cb?: (err?: Error) => void) {
        return new Promise(async (resolve) => {
            try {
                const dirPath = path.join(__dirname, './routes');
                await scanController(dirPath, this.app);

                cb && cb();
                this.errorMiddleWare();
                resolve(true);
            } catch (error: any) {
                if (cb) {
                    cb(error);
                } else {
                    throw error;
                }
            }
        });
    }

    private middleware() {
        const keys = Object.keys(middleware);

        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(middleware, key)) {
                if (key === 'morgan') {
                    const morgan = Object.getOwnPropertyDescriptor(middleware, key)?.value;
                    const logger = new morgan(path.join(__dirname, '../log/info'));
                    this.app.use(logger.useLogger());
                    continue;
                }
                if (key === 'errorMiddleware' || key === 'notFound') {
                    continue;
                }
                const value = Object.getOwnPropertyDescriptor(middleware, key)?.value;
                this.app.use(value);
            }
        }
    }

    private errorMiddleWare() {
        middleware.notFound(this.app.use.bind(this.app));
        this.app.use(middleware.errorMiddleware(path.join(__dirname, '../log/error')));
    }

    private set() {
        this.app.set('views', __dirname + '/views');
        this.app.set('view engine', 'ejs');
    }

    private config() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(cookieParser(Secret.COOKIE_SECRET));
        this.app.use(
            session({
                secret: Secret.COOKIE_SECRET,
                resave: false,
                saveUninitialized: true
            })
        );
    }

    private listen() {
        http.createServer(this.app).listen(Listen.PORT);
    }
}
