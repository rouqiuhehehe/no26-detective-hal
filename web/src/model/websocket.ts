import io, { Socket } from 'socket.io-client';
import { MessageBox } from 'element-ui';
import Router from '@/router';
import router from '@/router';
import { addRoutes } from '@/middleware/getRoutes';
import userOperation from '@/api/auth/user-operation';
import Store from '@/store';

interface SocketError extends Error {
    data: string;
}

// on事件类型
export interface ServerToClientEvents {
    'refresh-routes': () => void;
    'login-align': () => void;
}

// emit事件类型
export interface ClientToServerEvents {
    a: () => void;
}

export default class {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    public constructor() {
        this.socket = io(process.env.VUE_APP_API_URL, {
            auth: {
                authorization: sessionStorage.getItem('token') ?? ''
            },
            transports: ['websocket']
        });
        this.error();
        this.on();
    }

    private on() {
        this.socket.on('refresh-routes', async () => {
            await addRoutes(true);
        });
        this.socket.on('login-align', async () => {
            await MessageBox({
                title: '提示',
                message: '发生角色权限更改，请重新登录'
            });
            await userOperation.loginOut();
            Store.commit('CHANGE_USER_INFO', {});
            sessionStorage.removeItem('token');
            await router.push('/login');
        });
    }

    private error() {
        this.socket.on('connect_error', async (err) => {
            if ((err as SocketError).data === '403') {
                await MessageBox({
                    message: 'token失效，请重新登录',
                    title: '提示',
                    type: 'error'
                });
                sessionStorage.removeItem('token');
                await Router.push('/login');
            }
        });
    }
}
