import { scanController } from '@src/models/routes';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import http from 'http';
import path from 'path';
import { Secret } from './config/secret';
import { Listen } from './config/server_config';
import middleware from './middleware';

const dirname = process.env.NODE_ENV === 'development' ? __dirname : process.cwd();
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
                console.log(error, 10);

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
                if (key === 'errorMiddleware' || key === 'notFound' || key === 'morgan') {
                    continue;
                }
                const value = Object.getOwnPropertyDescriptor(middleware, key)?.value;
                this.app.use(value);
            }
        }
    }

    private errorMiddleWare() {
        // middleware.notFound(this.app.use.bind(this.app));
        this.app.use(middleware.errorMiddleware(path.join(dirname, '../log/error')));
    }

    private set() {
        this.app.set('views', path.join(dirname, 'public', 'ejs'));
        this.app.set('view engine', 'ejs');
    }

    private config() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(dirname, 'public')));
        this.app.use('/log', express.static(path.join(process.cwd(), 'log')));
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
