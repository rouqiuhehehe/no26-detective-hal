"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_1 = __importDefault(require("@src/descriptor/autobind"));
const child_process_1 = __importDefault(require("child_process"));
const net_1 = __importDefault(require("net"));
const os_1 = __importDefault(require("os"));
const posix_1 = __importDefault(require("path/posix"));
require("./work");
const port = 1337;
class ChildProcess {
    cpus = os_1.default.cpus();
    server = net_1.default.createServer();
    constructor() {
        this.server.listen(port, this.forkChildProcess);
    }
    forkChildProcess() {
        let i = 0;
        const len = this.cpus.length;
        this.cpus.forEach(() => {
            const cp = child_process_1.default.fork(posix_1.default.join(__dirname, './work.ts'), ['-r', 'src/bin.js']);
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
                        this.server.close();
                    }
                }
            });
        });
    }
}
__decorate([
    autobind_1.default,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChildProcess.prototype, "forkChildProcess", null);
exports.default = ChildProcess;
//# sourceMappingURL=index.js.map