"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _util_1 = __importDefault(require("@util"));
const file_stream_rotator_1 = __importDefault(require("file-stream-rotator"));
const path_1 = __importDefault(require("path"));
function errorLoger(dirPath, err) {
    const stream = file_stream_rotator_1.default.getStream({
        date_format: 'YYYYMMDD',
        filename: path_1.default.join(dirPath, 'access-%DATE%.log'),
        frequency: 'daily',
        verbose: false,
        max_logs: '10d'
    });
    stream.write(`\n[${_util_1.default.dateFormat(new Date(), 'yyyy-MM-dd HH.mm.ss')}]\n${err.stack ?? err} \n\n`, 'utf-8', (err) => {
        if (err) {
            console.error(err);
        }
    });
    stream.end();
}
exports.default = errorLoger;
//# sourceMappingURL=errorLoger.js.map