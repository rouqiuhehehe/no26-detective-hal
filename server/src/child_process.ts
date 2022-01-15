import ChildProcess from './models/child_process';
import errorLogger from './util/errorLogger';
export default class Cp extends ChildProcess {
    public constructor() {
        super();

        process.on('giveup', (len: number, during: number) => {
            errorLogger(new Error('重启过于频繁: ' + during + '内重启' + len + '次'));
        });
    }
}
