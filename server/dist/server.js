"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("@src/models/routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const secret_1 = require("./config/secret");
const server_config_1 = require("./config/server_config");
const middleware_1 = __importDefault(require("./middleware"));
class App {
    app;
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.set();
        this.middleware();
    }
    initRoute(cb) {
        return new Promise(async (resolve) => {
            try {
                const dirPath = path_1.default.join(__dirname, './routes');
                await (0, routes_1.scanController)(dirPath, this.app);
                cb && cb();
                resolve(true);
            }
            catch (error) {
                if (cb) {
                    cb(error);
                }
                else {
                    throw error;
                }
            }
        });
    }
    middleware() {
        const keys = Object.keys(middleware_1.default);
        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(middleware_1.default, key)) {
                if (key === 'morgan') {
                    const morgan = Object.getOwnPropertyDescriptor(middleware_1.default, key)?.value;
                    const logger = new morgan(path_1.default.join(__dirname, '../log/info'));
                    this.app.use(logger.useLogger());
                    continue;
                }
                if (key === 'errorMiddleware' || key === 'notFound') {
                    continue;
                }
                const value = Object.getOwnPropertyDescriptor(middleware_1.default, key)?.value;
                this.app.use(value);
            }
        }
    }
    errorMiddleWare() {
        middleware_1.default.notFound(this.app.use.bind(this.app));
        this.app.use(middleware_1.default.errorMiddleware(path_1.default.join(__dirname, '../log/error')));
    }
    set() {
        this.app.set('views', __dirname + '/views');
        this.app.set('view engine', 'ejs');
    }
    config() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        this.app.use((0, cookie_parser_1.default)(secret_1.Secret.COOKIE_SECRET));
        this.app.use((0, express_session_1.default)({
            secret: secret_1.Secret.COOKIE_SECRET,
            resave: false,
            saveUninitialized: true
        }));
    }
    listen() {
        http_1.default.createServer(this.app).listen(server_config_1.Listen.PORT);
    }
}
exports.default = App;
//# sourceMappingURL=server.js.map