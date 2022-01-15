import { ControllerMetadata } from '@src/descriptor/controller';
import HttpError from '@src/models/httpError';
import crypto from 'crypto';
import events from 'events';
import { Request } from 'express';
import fs from 'fs';
import fsPromise from 'fs/promises';
import iconv from 'iconv-lite';
import path from 'path';
import { Status } from '../config/server_config';
import variableTypes from './variable_type';

export enum DescriptorKey {
    CLASS = 'classDescriptor',
    METHOD = 'methodDescriptor'
}

export enum DescriptorType {
    DATA = 'data',
    ACCESSOR = 'accessor',
    UNDEFINED = 'undefined'
}

const channel = new events.EventEmitter();

export default class Util {
    public static channel = channel;
    public static variableTypes = variableTypes;

    public static getUrlWithHost(url: string) {
        return new URL(url, process.env.HTTP_URL_HOST as string).href;
    }

    public static isAbsoluteURL(url: string) {
        // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
        // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
        // by any combination of letters, digits, plus, period, or hyphen.
        return new RegExp('^([a-z][a-zd+-.]*:)?//', 'i').test(url);
    }

    public static middlewareDescriptor(
        target: Object,
        propertyKey: string | symbol | undefined,
        descriptor: PropertyDescriptor | undefined,
        fn: (v: DescriptorKey) => void
    ) {
        if (propertyKey && descriptor && fn) {
            // 如果是子路由，需要当前路由
            // 放入下一次事件循环执行，让父类装饰器先执行
            process.nextTick(() => {
                const hasRoutes = Reflect.hasMetadata(ControllerMetadata.ROUTES, target);

                if (hasRoutes) {
                    fn(DescriptorKey.METHOD);
                } else {
                    // 需要先定义路由
                    throw new HttpError(
                        Status.SERVER_ERROR,
                        'routes is undefined, is maybe that the descriptor in the wrong order'
                    );
                }
            });
        } else {
            // 如果是父级别路由，只需判断是否有homePath
            const hasHomePath = Reflect.hasMetadata(ControllerMetadata.HOMEPATH, target);

            if (hasHomePath) {
                fn(DescriptorKey.CLASS);
            } else {
                throw new HttpError(Status.SERVER_ERROR, (target as Function).name + ' does not has homePath');
            }
        }
    }

    public static ascllSort<T extends Record<string, any>>(obj: T) {
        const sortkeys = Object.keys(obj).sort();
        const newObj: Record<string, any> = {};

        for (const i of sortkeys) {
            newObj[i] = obj[i];
        }

        return newObj;
    }

    /**
     * 根据路径循环创建文件夹
     * @param pathWithFile 文件路径
     */
    public static mkDirForFile(pathWithFile: string) {
        path.dirname(pathWithFile)
            .split(path.sep)
            .reduce((fullPath, folder) => {
                // tslint:disable-next-line: no-parameter-reassignment
                fullPath += folder + path.sep;
                // Option to replace existsSync as deprecated. Maybe in a future release.
                // try{
                //     var stats = fs.statSync(fullPath);
                //     console.log('STATS',fullPath, stats);
                // }catch(e){
                //     fs.mkdirSync(fullPath);
                //     console.log("STATS ERROR",e)
                // }
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath);
                }
                return fullPath;
            }, '');
    }

    public static dateFormat(dft: string | number | Date, format: string): string {
        const dateObj = new Date(dft);
        let k;
        const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        let _format = format;

        const o: Record<string, number | string> = {
            'M+': dateObj.getMonth() + 1,
            'd+': dateObj.getDate(),
            // tslint:disable-next-line:no-magic-numbers
            'h+': dateObj.getHours() % 12,
            'H+': dateObj.getHours(),
            'm+': dateObj.getMinutes(),
            's+': dateObj.getSeconds(),
            'q+': Math.floor((dateObj.getMonth() + 3) / 3),
            'S+': dateObj.getMilliseconds(),
            'W+': week[dateObj.getDay()]
        };

        if (/(y+)/.test(_format)) {
            _format = _format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

        for (k in o) {
            if (new RegExp('(' + k + ')').test(_format)) {
                _format = _format.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1 ? `${o[k]}` : ('00' + o[k]).substr(('' + o[k]).length)
                );
            }
        }

        if (!dft) {
            return '';
        }

        return _format;
    }

    /**
     * 获取命令行参数
     */
    public static getCmdParams() {
        const params = process.argv.splice(2);
        const paramsObj: Record<string, string> = {};
        for (const item of params) {
            const format = item.slice(2);
            const paramsArr = format.split('=');
            paramsObj[paramsArr[0]] = paramsArr[1];
        }

        return paramsObj;
    }

    /**
     * 阻塞
     */
    public static sleep(time: number): Promise<true> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        });
    }

    /**
     * 获取没有参数的完整url
     */
    public static getNoParamsUrl(req: Request) {
        const urlObj = new URL(req.url, req.protocol + '://' + req.get('host'));
        return urlObj.pathname;
    }

    /**
     * 获取不带协议头和ip的url路径
     */
    public static getNoHostUrl(url: string) {
        return new URL(url).pathname;
    }

    public static md5Crypto(password: string) {
        const hash = crypto.createHash('md5');
        hash.update(password);

        return hash.digest('hex');
    }

    public static async md5File(filePath: string) {
        try {
            const data = await fsPromise.readFile(filePath);
            return crypto.createHash('md5').update(data.toString(), 'utf8').digest('hex');
        } catch (error) {
            throw error;
        }
    }

    public static getFunctionTypeByDescriptor(descriptor: PropertyDescriptor) {
        if (Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
            return DescriptorType.DATA;
        } else if (
            Object.prototype.hasOwnProperty.call(descriptor, 'get') ||
            Object.prototype.hasOwnProperty.call(descriptor, 'set')
        ) {
            return DescriptorType.ACCESSOR;
        } else {
            return DescriptorType.UNDEFINED;
        }
    }

    public static getFunctionByDescriptor(descriptor: PropertyDescriptor) {
        const fnType = Util.getFunctionTypeByDescriptor(descriptor);

        let type: DescriptorType;
        let fn;
        switch (fnType) {
            case DescriptorType.DATA:
                if (typeof descriptor.value !== 'function') {
                    throw new TypeError(descriptor.value + ' is not a function');
                }
                type = DescriptorType.DATA;
                fn = descriptor.value;
                break;
            case DescriptorType.ACCESSOR:
                if (typeof descriptor.set !== 'function') {
                    throw new TypeError(descriptor.set!.name + ' is not a function');
                }
                if (typeof descriptor.get !== 'function') {
                    throw new TypeError(descriptor.get!.name + ' is not a function');
                }
                type = DescriptorType.ACCESSOR;
                fn = {
                    get: descriptor.get,
                    set: descriptor.set
                };
                break;
            case DescriptorType.UNDEFINED:
                return {
                    type: DescriptorType.UNDEFINED,
                    fn: DescriptorType.UNDEFINED
                };
        }

        return {
            type,
            fn
        };
    }

    /**
     * 通过流的形式读取文件
     */
    public static dataByReadStream(
        path: Parameters<typeof fs.createReadStream>[0],
        option?: Parameters<typeof fs.createReadStream>[1],
        encoding = 'utf8'
    ) {
        const rs = fs.createReadStream(
            path,
            option ?? {
                highWaterMark: 3
            }
        );

        return new Promise((resolve, reject) => {
            const res: Buffer[] = [];
            rs.on('data', (chunk: Buffer) => {
                res.push(chunk);
            });

            rs.on('end', () => {
                const buf = Buffer.concat(res);

                const str = iconv.decode(buf, encoding);

                resolve(str);
            });

            rs.on('error', (err) => {
                reject(err);
            });
        });
    }

    public static isExtendsHttpError<T extends Error>(err: any): err is HttpError<T> {
        return err instanceof HttpError;
    }

    public static deepClone(obj: any) {
        if (typeof obj !== 'object' || obj === null || obj instanceof Date) {
            return obj;
        } else {
            const newObj: any = Array.isArray(obj) ? [] : {};
            if (obj && typeof obj === 'object') {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        newObj[key] = Util.deepClone(obj[key]);
                    }
                }
            }
            return newObj;
        }
    }

    public static isEmpty(obj: unknown) {
        if (typeof obj !== 'object') {
            return !obj;
        } else {
            // tslint:disable-next-line: forin
            for (const i in obj) {
                return false;
            }
            return true;
        }
    }
}
