import Util, { DescriptorKey } from '@util';
import AntiReplay from './middleware/anti-replay';
import Auth from './middleware/auth';
import authorization from './middleware/authorization';
import Log from './middleware/log';
import timestamp from './middleware/timestamp';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from './middlewareHandle';

type Callback = (req: ExpressRequest, res: ExpressResPonse, next: NextFunction) => void;

export function validateController(middleWare: Callback, type: DefaultMiddleWareType) {
    return (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
            if (result === DescriptorKey.CLASS) {
                classLogHandler(target as Function, type, middleWare);
            } else {
                methodLogHandler(target, propertyKey!, type, middleWare);
            }
        });
    };
}
export default function Middleware(
    params?: (Omit<DefaultMiddleWareType, 'CUSTOM' | 'custom'> | 'default' | Callback)[]
) {
    if (!params) {
        // tslint:disable-next-line: no-parameter-reassignment
        params = ['default'];
    }
    params.forEach((v, i) => {
        v === DefaultMiddleWareType.CUSTOM;
        if (v === 'default') {
            params!.splice(
                i,
                1,
                DefaultMiddleWareType.AUTHORIZATION,
                DefaultMiddleWareType.ANTI_REPLAY,
                DefaultMiddleWareType.AUTH,
                DefaultMiddleWareType.TIMESTAMP
            );
        }
    });
    // tslint:disable-next-line: no-parameter-reassignment
    params = [...new Set(params)];
    return (target: Object | Function, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        params!.forEach((v) => {
            if (typeof v === 'string') {
                switch (v) {
                    case DefaultMiddleWareType.LOG:
                        Log()(target, propertyKey, descriptor);
                        break;
                    case DefaultMiddleWareType.ANTI_REPLAY:
                        AntiReplay(target, propertyKey, descriptor);
                        break;
                    case DefaultMiddleWareType.AUTH:
                        Auth(target, propertyKey, descriptor);
                        break;
                    case DefaultMiddleWareType.AUTHORIZATION:
                        authorization(target, propertyKey, descriptor);
                        break;
                    case DefaultMiddleWareType.TIMESTAMP:
                        timestamp(target, propertyKey, descriptor);
                        break;
                }
            } else if (typeof v === 'function') {
                validateController(v, DefaultMiddleWareType.CUSTOM)(target, propertyKey, descriptor);
            }
        });
    };
}
