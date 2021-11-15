import autoBind from '@src/descriptor/autobind';
import childProcess from 'child_process';
import net from 'net';
import os from 'os';
import path from 'path/posix';
import './work';

/*
    类型         回调/异常    进程类型     执行类型         可设置超时
    spawn()         X          任意        命令              X
    exec()          √          任意        命令              √
    execFile()      X          任意      可执行文件           √
    fork()          √          node     JavaScript文件       X
*/
const port = 1337;

export default class ChildProcess {
    protected cpus = os.cpus();
    protected server = net.createServer();

    public constructor() {
        // 创建tcp服务，发射给子进程
        this.server.listen(port, this.forkChildProcess);
    }

    @autoBind
    protected forkChildProcess() {
        let i = 0;
        const len = this.cpus.length;

        [0, 0].forEach(() => {
            const cp = childProcess.fork(path.join(__dirname, './work.ts'), ['-r', 'src/bin.js']);
            cp.on('error', (err) => {
                console.log(err);
            });

            cp.on('close', (code) => {
                console.log(code);
            });

            cp.on('message', (msg) => {
                if (msg === 'init') {
                    cp.send('tcp', this.server);
                    i++;

                    if (i === len) {
                        // 发射完成后，关闭主进程tcp服务
                        this.server.close();
                    }
                }
            });
        });
    }
}
