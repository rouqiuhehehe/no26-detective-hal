"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("@src/server"));
const http_1 = __importDefault(require("http"));
const app = new server_1.default();
app.initRoute().then(() => {
    console.log(88);
    const server = http_1.default.createServer(app.app);
    process.send && process.send('init');
    console.log(10);
    process.on('message', (e, net) => {
        console.log(9);
        if (e === 'tcp') {
            console.log(8);
            net.on('connection', (socket) => {
                console.log(7);
                server.emit('connection', socket);
            });
        }
    });
});
//# sourceMappingURL=work.js.map