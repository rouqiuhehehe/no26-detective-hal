import App from '@src/server';
import errorLogger from '@src/util/errorLogger';
import http from 'http';
import net from 'net';
import { Server } from 'socket.io';
import io, { ClientToServerEvents, ServerToClientEvents } from '@src/models/webSocket';
import path from 'path';

const app = new App();
// tslint:disable-next-line:no-var-requires
(global as any).baseConfig = require(path.join(process.cwd(), 'config', 'base-config'));

app.initRoute().then(() => {
    const server = http
        .createServer((...arg) => {
            app.app(...arg);
        })
        .on('clientError', (err) => {
            console.log(err, 1231);
        })
        .listen(1337, () => {
            console.log('服务器启动完毕');
        });
    // @ts-ignore
    const webSocket = new Server<ServerToClientEvents, ClientToServerEvents>(server, {
        transports: ['websocket']
    });
    new io(webSocket);
    let worker: net.Server;
    const timeoutTime = 5000;

    process.send && process.send('init');

    process.on('message', (e, net: net.Server) => {
        if (e === 'tcp') {
            worker = net;
            net.on('connection', (socket) => {
                console.log(10);
                server.emit('connection', socket);
                socket.on('data', (data) => {
                    console.log(data.toString(), 7789);
                });
                socket.on('end', () => {
                    console.log(socket.localAddress, 75775);
                });
                socket.on('close', (e) => {
                    console.log(e, 5555);
                });
            });
        } else {
            console.log(process.pid, e);
        }
    });

    process.on('uncaughtException', (err) => {
        errorLogger(err, undefined, undefined, () => {
            process.send && process.send('suicide');

            worker.close(() => {
                process.exit(1);
            });

            // 设置超时时间，强制退出进程
            setTimeout(() => {
                process.exit(1);
            }, timeoutTime);
        });
    });
});
