// noinspection ES6PreferShortImport

import axios from 'axios';
import chai from 'chai';
import crypto from 'crypto';
import fs from 'fs';
import { describe } from 'mocha';
import mocksHttp from 'node-mocks-http';
import path from 'path';
import sinon, { SinonAssert } from 'sinon';
import sinonChai from 'sinon-chai';
import { Secret } from '../../src/config/secret';
import config from '../config';

chai.use(sinonChai); // This is crucial to get Sinon's assertions.

declare global {
    namespace Chai {
        interface Assertion extends SinonAssert, LanguageChains, NumericComparison, TypeComparison {
            abc: string;
        }
    }
}

enum User {
    USER_NAME = 'test',
    PASSWORD = '606ce175da9b5452c868a6b305f1f733'
}

export default class {
    protected expect = chai.expect;
    protected describe = describe;
    protected mocksHttp = mocksHttp;
    protected sinon = sinon;
    protected axios = axios;
    protected authToken = '';
    private allExcludes = ['/auth', '/admin'];
    private tokenExcludes = ['/auth/management-system'];
    private cookieserver: string[] = [];

    // hmac_sha256秘钥
    private HMACSHA256KEY = '1001';

    public constructor() {
        if (!this.axios.defaults.baseURL) {
            this.initAxios();
        }
    }

    protected async login() {
        try {
            const {
                data: { salt }
            } = await this.axios.get('/auth/management-system/get-salt');

            const md5Password = this.md5Crypto(this.md5Crypto(User.PASSWORD + Secret.PASSWORD_SECRET) + salt);

            const body = {
                username: User.USER_NAME,
                password: md5Password
            };

            const {
                data: { token }
            } = await this.axios.post('/auth/management-system/login', body);

            this.authToken = token;

            return token;
        } catch (error) {
            throw error;
        }
    }

    protected encodedDataByPublicKey(obj: Record<string, any>) {
        const publicKey = fs.readFileSync(path.join(`${process.cwd()}/key/rsa_public.key`));
        const hash = crypto.createHmac('sha256', this.HMACSHA256KEY);

        const stringData = JSON.stringify(this.ascllSort(obj));
        const hashed = hash.update(stringData).digest('hex').toString();

        const encodedData = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(hashed)
        );

        return encodedData.toString('base64');
    }

    protected isEmpty(obj: unknown) {
        if (typeof obj !== 'object') {
            return !obj;
        } else {
            for (const i in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, i)) {
                    return false;
                }
            }
            return true;
        }
    }

    protected _r(a: number) {
        const c = Math.abs(parseInt(`${new Date().getTime() * Math.random() * 10000}`, 10)).toString();
        let d = 0;
        for (const b of c) {
            d += parseInt(b, 10);
        }
        const e = ((f) => {
            return (g: number, h: number) => {
                return (f[h] || (f[h] = Array(h + 1).join('0'))) + g;
            };
        })([] as string[]);
        d += c.length;
        const f = e(d, 3 - d.toString().length);
        return a.toString() + c + f;
    }

    private initAxios() {
        this.axios.defaults.baseURL = config.baseUrl;
        this.axios.interceptors.request.use(
            (config) => {
                const { url } = config;
                if (url) {
                    if (this.allExcludes.some((v) => new RegExp(`^${v}`).test(url))) {
                        let params = config.params ?? {};
                        let data = config.data ?? {};
                        const _r = this._r(1);
                        const timestamp = Date.now().toString();
                        const token = this.authToken;
                        params._r = _r;
                        params.timestamp = timestamp;
                        params = this.formatParams(params);
                        data = this.formatParams(data);

                        config.params = params;
                        config.data = data;
                        let Authorization: Record<string, any> = {};
                        Authorization = {
                            ...params,
                            ...data
                        };

                        if (!token && !this.isTokenExcludes(url)) {
                            throw new axios.Cancel('请先调用登陆方法');
                        }

                        if (!this.isTokenExcludes(url)) {
                            Authorization.authorization = token;
                            (config.headers ?? (config.headers = {})).Authorization = token;
                        }

                        // 通过公钥对数据加密
                        const encrypt = this.encodedDataByPublicKey(Authorization);
                        // 加密数据添加到请求头中
                        if (encrypt) {
                            config.params.sign = encrypt;
                        } else {
                            throw new axios.Cancel('参数加密错误');
                        }
                    }
                }
                config.headers!.Cookie = this.cookieserver.join('');
                return config;
            },
            (err) => {
                return Promise.reject(err);
            }
        );

        this.axios.interceptors.response.use((response) => {
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            this.cookieserver = response.headers['set-cookie'] ?? [];
            return response.data;
        });
    }

    private md5Crypto(password: string) {
        const hash = crypto.createHash('md5');
        hash.update(password);

        const md5Password = hash.digest('hex');
        return md5Password;
    }

    private ascllSort<T extends Record<string, any>>(obj: T) {
        const sortkeys = Object.keys(obj).sort();
        const newObj: Record<string, any> = {};

        for (const i of sortkeys) {
            newObj[i] = obj[i];
        }

        return newObj;
    }

    private formatParams<T extends Object>(obj: T): T | Record<string, unknown> {
        const params = {};
        function _(objC: T, params: Record<string, unknown>) {
            const C = <A, U extends keyof A>(o: A, name: U): A[U] => {
                return o[name];
            };
            for (const i in objC) {
                if (Reflect.has(objC, i)) {
                    const item = C(objC, i);
                    if (typeof item === 'boolean' || typeof item === 'number') {
                        params[i] = item;
                        continue;
                    }
                    if (!item) {
                        delete params[i];
                        continue;
                    } else {
                        if (item instanceof Array) {
                            if (item.length === 0) {
                                delete params[i];
                                continue;
                            } else {
                                params[i] = item;
                                continue;
                            }
                        } else if (item instanceof Object) {
                            params[i] = item;
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            _(item as any, params[i] as Record<string, unknown>);
                            if (JSON.stringify(params[i]) === '{}') delete params[i];
                            continue;
                        }
                        params[i] = item;
                    }
                }
            }
        }
        _(obj, params);
        return params;
    }

    private isTokenExcludes(url: string) {
        return this.tokenExcludes.some((v) => new RegExp(`^${v}`).test(url));
    }
}
