import autoBind from '@src/descriptor/Autobind';
import childProcess from 'child_process';
import net from 'net';
import os from 'os';
import path from 'path';
// tslint:disable-next-line:no-var-requires
(global as any).baseConfig = require(path.join(process.cwd(), 'config', 'base-config'));
/*
    类型         回调/异常    进程类型     执行类型         可设置超时
    spawn()         X          任意        命令              X
    exec()          √          任意        命令              √
    execFile()      X          任意      可执行文件           √
    fork()          √          node     JavaScript文件       X
*/
const port = 1337;
const inspectPort = 9229;
const dev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
export default class ChildProcess {
    protected cpus = os.cpus();
    protected server = net.createServer({
        // @ts-ignore
        keepAlive: true
    });
    private workerMap = new Map();
    private workerCount = 0;
    private readonly len: number;
    private readonly limit = 10;
    // 10次重启的超时时间
    private readonly during = 60000;
    private restart: number[] = [];

    public constructor() {
        if (dev) {
            // 如果是开发环境，不需要起太多进程
            this.len = 2;
        } else {
            this.len = this.cpus.length;
        }
        this.len = global.baseConfig.processLen ?? this.len;

        // 创建tcp服务，发射给子进程
        // this.server.listen(port, this.forkChildProcess);

        import('./work');
        process.on('exit', () => {
            this.workerMap.forEach((v: childProcess.ChildProcess) => {
                v.kill();
            });
        });
    }

    @autoBind
    protected forkChildProcess() {
        let processFilePath = '/work.js';

        if (dev) {
            processFilePath = '/work.ts';
        }

        let index = this.len;

        while (index--) {
            this.createWorker(processFilePath, index);
        }
    }

    private createWorker(path: string, index: number) {
        const arg: string[] = [];
        if (this.isTooFrequently()) {
            // 发送报警事件，不再重启
            return process.emit('giveup', this.restart.length, this.during);
        }
        if (dev) {
            arg.push('-r', `${process.cwd()}/bin.js`);
        }
        // 多进程google调试
        if (process.execArgv.includes('--inspect')) {
            arg.unshift(`--inspect=${(inspectPort + index + 1).toString()}`);
        }

        const cp = childProcess.fork(__dirname + path, [], {
            execArgv: arg
        });

        this.workerMap.set(cp.pid, cp);

        cp.on('error', (err) => {
            console.log(err, 'child_err');
        });

        cp.on('close', (code) => {
            console.log(code, 'child_code');
        });

        cp.on('message', (msg) => {
            if (msg === 'init') {
                cp.send('tcp', this.server);
                this.workerCount++;
                cp.send(this.workerCount);

                if (this.workerCount === this.len) {
                    // 发射完成后，关闭主进程tcp服务
                    // this.server.close(() => {
                    console.log('服务启动完毕');
                    // });
                }
            } else if (msg === 'suicide') {
                this.createWorker(path, index);
            }
        });

        cp.on('exit', () => {
            console.log(`worker ${cp.pid} exited`);
            this.workerMap.delete(cp.pid);
        });

        return cp;
    }

    private isTooFrequently() {
        // 当前重启时间
        const time = Date.now();

        const len = this.restart.push(time);

        if (len > this.limit) {
            this.restart = this.restart.slice(this.limit * -1);
        }

        // 判断restart数组长度是否大于最大重启数，如果大于则判断最后一次重启时间-第一次重启时间是否小于超时时间，超时则报错，取消重启
        return (
            this.restart.length >= this.limit && this.restart[this.restart.length - 1] - this.restart[0] < this.during
        );
    }
}
