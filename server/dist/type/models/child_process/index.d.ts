/// <reference types="node" />
import net from 'net';
import os from 'os';
import './work';
export default class ChildProcess {
    protected cpus: os.CpuInfo[];
    protected server: net.Server;
    constructor();
    protected forkChildProcess(): void;
}
