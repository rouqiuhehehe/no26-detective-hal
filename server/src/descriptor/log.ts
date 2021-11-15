import Morgan from '@src/middleware/morgan';
import Util, { DescriptorKey } from '@util';
import path from 'path';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from './middlewareHandle';

const logger = new Morgan(path.join(__dirname, '../../log/info'));
const loggerMiddleware = logger.useLogger();

function Log(dev?: 'dev') {
    return (target: Object | Function, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
            if (result === DescriptorKey.CLASS) {
                if (dev === 'dev') {
                    if (process.env.NODE_ENV === 'development') {
                        classLogHandler(target as Function, DefaultMiddleWareType.LOG, loggerMiddleware);
                    }
                } else {
                    classLogHandler(target as Function, DefaultMiddleWareType.LOG, loggerMiddleware);
                }
            } else {
                if (dev === 'dev') {
                    if (process.env.NODE_ENV === 'development') {
                        methodLogHandler(target, propertyKey!, DefaultMiddleWareType.LOG, loggerMiddleware);
                    }
                } else {
                    methodLogHandler(target, propertyKey!, DefaultMiddleWareType.LOG, loggerMiddleware);
                }
            }
        });
    };
}
export default Log;
