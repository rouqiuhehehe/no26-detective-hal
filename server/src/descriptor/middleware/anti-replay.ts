import redis from '@src/bin/redis';
import { ErrorMsg } from '@src/config/error';
import { RedisKey } from '@src/config/key';
import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import Util, { DescriptorKey } from '@util';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from '../middlewareHandle';

const ANTI_REPLAY_NUM = 90000;

export default function antiReplay(target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
        if (result === DescriptorKey.CLASS) {
            classLogHandler(target as Function, DefaultMiddleWareType.ANTI_REPLAY, redisPushReplay);
        } else {
            methodLogHandler(target, propertyKey!, DefaultMiddleWareType.ANTI_REPLAY, redisPushReplay);
        }
    });
}

export async function redisPushReplay(req: ExpressRequest, _res: ExpressResponse, next: NextFunction) {
    const { _r } = req.query;
    const { antiReplay } = global.baseConfig;
    if (!antiReplay) {
        return next();
    }
    if (!_r) {
        return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.MISSING_REPLAY_PARAMS));
    }

    // tslint:disable-next-line: no-magic-numbers
    if (_r.length !== 19 && _r.length !== 20 && _r.length !== 21 && (_r as string)[0] !== '1') {
        return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.ERROR_REPLAY_PARAMS));
    }

    try {
        await redis(async (client, quit) => {
            const data = await client.lRange(RedisKey.ANTI_REPLAY, 0, -1);

            if (data && data.length) {
                if (data.some((v) => v === _r)) {
                    return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.ERROR_REPLAY_PARAMS));
                } else {
                    // 判断储存的防重放是否超过阀值
                    const len = await client.lLen(RedisKey.ANTI_REPLAY);
                    if (len >= ANTI_REPLAY_NUM) {
                        const num = await client.del(RedisKey.ANTI_REPLAY);
                        if (num === 1) {
                            // 没有存放的数据，则往里插
                            await client.rPush(RedisKey.ANTI_REPLAY, _r as string);
                            await quit();
                            next();
                        }
                    } else {
                        // 没有到达阀值，则往里插
                        await client.rPush(RedisKey.ANTI_REPLAY, _r as string);
                        await quit();
                        next();
                    }
                }
            } else {
                await client.rPush(RedisKey.ANTI_REPLAY, _r as string);
                await quit();
                next();
            }
        });
    } catch (error: any) {
        next(new HttpError(Status.SERVER_ERROR, ErrorMsg.REDIS_ERROR, error));
    }
}
