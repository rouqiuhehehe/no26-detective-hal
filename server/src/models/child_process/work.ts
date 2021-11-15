import App from '@src/server';
import http from 'http';
import net from 'net';

const app = new App();
app.initRoute().then(() => {
    const server = http.createServer(app.app);

    process.send && process.send('init');

    process.on('message', (e, net: net.Server) => {
        if (e === 'tcp') {
            net.on('connection', (socket) => {
                server.emit('connection', socket);
            });
        }
    });
});
