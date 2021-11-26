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

function redisPushReplay(req: ExpressRequest, _res: ExpressResPonse, next: NextFunction) {
    const { _r } = req.query;

    if (!_r) {
        return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.MISSING_REPLAY_PARAMS));
    }

    // tslint:disable-next-line: no-magic-numbers
    if (_r.length !== 19 && _r.length !== 20 && _r.length !== 21 && (_r as string)[0] !== '1') {
        return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.ERROR_REPLAY_PARAMS));
    }

    redis.lrange(RedisKey.ANTI_REPLAY, 0, -1, (err, data) => {
        if (err) {
            return next(new HttpError(Status.SERVER_ERROR, err.message, err));
        }

        if (data && data.length) {
            if (data.some((v) => v === _r)) {
                return next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.ERROR_REPLAY_PARAMS));
            } else {
                // 判断储存的防重放是否超过阀值
                redis.llen(RedisKey.ANTI_REPLAY, (err, len) => {
                    if (err) {
                        return next(new HttpError(Status.SERVER_ERROR, err.message, err));
                    }

                    if (len >= ANTI_REPLAY_NUM) {
                        redis.del(RedisKey.ANTI_REPLAY, (err, num) => {
                            if (err) {
                                return next(new HttpError(Status.SERVER_ERROR, err.message, err));
                            }

                            if (num === 1) {
                                // 没有存放的数据，则往里插
                                redis.rpush(RedisKey.ANTI_REPLAY, _r as string, (err) => {
                                    if (err) {
                                        return next(new HttpError(Status.SERVER_ERROR, err.message, err));
                                    }
                                    next();
                                });
                            }
                        });
                    } else {
                        // 没有到达阀值，则往里插
                        redis.rpush(RedisKey.ANTI_REPLAY, _r as string, (err) => {
                            if (err) {
                                return next(new HttpError(Status.SERVER_ERROR, err.message, err));
                            }
                            next();
                        });
                    }
                });
            }
        } else {
            redis.rpush(RedisKey.ANTI_REPLAY, _r as string, (err) => {
                if (err) {
                    return next(new HttpError(Status.SERVER_ERROR, err.message, err));
                }

                // tslint:disable-next-line: no-magic-numbers
                redis.expire(RedisKey.ANTI_REPLAY, 60 * 60);
                next();
            });
        }
    });
}
