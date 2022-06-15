import { ErrorMsg } from '@src/config/error';
import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import Util, { DescriptorKey } from '@util';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
// tslint:disable-next-line: no-implicit-dependencies
import qs from 'qs';
import { classLogHandler, DefaultMiddleWareType, methodLogHandler } from '../middlewareHandle';

const privateKeyPath = path.join(`${process.cwd()}/key/rsa_private.key`);
// hmac_sha256秘钥
export const HMACSHA256KEY = '1001';

// 过滤不需要验证的接口
const excludesArr = ['/api/getpubkey'];

export default function authorization(target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    Util.middlewareDescriptor(target, propertyKey, descriptor, (result) => {
        if (result === DescriptorKey.CLASS) {
            classLogHandler(target as Function, DefaultMiddleWareType.AUTHORIZATION, authorizationMiddleware);
        } else {
            methodLogHandler(target, propertyKey!, DefaultMiddleWareType.AUTHORIZATION, authorizationMiddleware);
        }
    });
}

export function authorizationMiddleware(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    const originalUrl = Util.getNoParamsUrl(req);
    const { encrypt } = global.baseConfig;
    if (!encrypt) {
        return next();
    }
    if (!excludesArr.includes(originalUrl)) {
        // 读取请求头消息
        const Authorization = req.query.sign as string;
        if (Authorization) {
            try {
                // const JSencrypt = new jsencrypt();
                // JSencrypt.setPrivateKey(fs.readFileSync(privateKeyPath).toString());
                // const decryptText = JSencrypt.decrypt(Authorization);

                const decryptText = crypto
                    .privateDecrypt(
                        {
                            key: fs.readFileSync(privateKeyPath),
                            padding: crypto.constants.RSA_PKCS1_PADDING
                        },
                        Buffer.from(Authorization, 'base64')
                    )
                    .toString();

                try {
                    if (decryptText) {
                        const hash = crypto.createHmac('sha256', HMACSHA256KEY);
                        const { query, body } = req;
                        const authorization = req.get('authorization');
                        const deepCloneQuery = Util.deepClone(query);
                        // 把sign签名删掉和前端参数做对比，深克隆query，避免把request中的query.sign删掉
                        Reflect.deleteProperty(deepCloneQuery, 'sign');
                        const obj = {
                            ...deepCloneQuery,
                            ...body,
                            authorization
                        };
                        if (!authorization) {
                            Reflect.deleteProperty(obj, 'authorization');
                        }
                        const params = qs.stringify(Util.ascllSort(obj));
                        const hashed = hash.update(params).digest('hex').toString();

                        if (decryptText === hashed) {
                            const success = res.success;
                            // 修改响应，添加响应头
                            res.success = (body: any, pagination?) => {
                                // tslint:disable-next-line: no-parameter-reassignment
                                body = body ?? {
                                    value: true
                                };
                                res.header(
                                    'authorization',
                                    crypto
                                        .createHmac('sha256', HMACSHA256KEY)
                                        .update(JSON.stringify(body))
                                        .digest()
                                        .toString('hex')
                                );
                                return success(body, pagination);
                            };
                            next();
                        } else {
                            next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.HASH_ERROR));
                        }
                    } else {
                        next(new HttpError(Status.MISSING_PARAMS, ErrorMsg.HASH_ERROR));
                    }
                } catch (e: any) {
                    next(new HttpError(Status.SERVER_ERROR, e.message, e));
                }
            } catch (e: any) {
                next(new HttpError(Status.SERVER_ERROR, e.message, e));
            }
        } else {
            next(new HttpError(Status.SERVER_ERROR, ErrorMsg.HASH_ERROR));
        }
    }
}
