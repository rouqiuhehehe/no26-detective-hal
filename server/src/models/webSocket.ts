import { Server, Socket } from 'socket.io';
import User from '@src/models/user';

// on事件类型
export interface ServerToClientEvents {
    a: () => void;
}

// emit事件类型
export interface ClientToServerEvents {
    'refresh-routes': () => void;
    'login-align': () => void;
}

interface SocketError extends Error {
    data: string;
}
export const socketRoleByIdMap = new Map<string, [string, Socket<ServerToClientEvents, ClientToServerEvents>]>();
const user = new User();
export default class<T extends Server<ServerToClientEvents, ClientToServerEvents>> {
    public constructor(private server: T) {
        this.init();
        this.use();
    }

    private error(message: string, data: string) {
        const err = new Error(message) as SocketError;
        err.data = data;
        return err;
    }

    private init() {
        this.server.on('connection', async (socket) => {
            const { authorization: token } = socket.handshake.auth;
            const { uid } = await user.getUserInfoByToken(token);
            socketRoleByIdMap.set(uid, [token, socket]);
        });
    }

    private use() {
        this.server.use(async (socket, next) => {
            const { authorization: token } = socket.handshake.auth;
            if (!token) {
                const { uid } = await user.getUserInfoByToken(token);
                if (socketRoleByIdMap.has(uid)) {
                    socketRoleByIdMap.delete(uid);
                }
                return next(this.error('缺少token, 请登陆后操作', '403'));
            }
            next();
        });
    }
}
