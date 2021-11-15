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
const _util_1 = __importDefault(require("@util"));
const file_stream_rotator_1 = __importDefault(require("file-stream-rotator"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
let Morgan = class Morgan {
    dirPath;
    constructor(dirPath) {
        this.dirPath = dirPath;
    }
    useLogger() {
        const key = this.morganforMat();
        return (0, morgan_1.default)(key, {
            stream: this.fileStreamRotatorGetStream()
        });
    }
    morganforMat() {
        const dateFormat = _util_1.default.dateFormat(new Date(), 'yyyy-MM-dd HH.mm.ss');
        const key = 'dev_params';
        morgan_1.default.token('requestParameters', (req, _res) => {
            return JSON.stringify(req.query) || '-';
        });
        morgan_1.default.token('requestBody', (req, _res) => {
            return JSON.stringify(req.body) || '-';
        });
        morgan_1.default.format(key, `[${dateFormat}] :method :url :status :requestParameters :requestBody`);
        return key;
    }
    fileStreamRotatorGetStream() {
        return file_stream_rotator_1.default.getStream({
            date_format: 'YYYYMMDD',
            filename: path_1.default.join(this.dirPath, 'access-%DATE%.log'),
            frequency: 'daily',
            verbose: false,
            max_logs: '10d'
        });
    }
};
Morgan = __decorate([
    autobind_1.default,
    __metadata("design:paramtypes", [String])
], Morgan);
exports.default = Morgan;
//# sourceMappingURL=morgan.js.map