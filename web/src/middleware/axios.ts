import cfg from '@/config';
import router from '@/router';
import utils from '@/utils';
import formatParams from '@/utils/formatParams';
import axios from 'axios';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import ElementUI, { Loading, MessageBox } from 'element-ui';
import jsencrypt from 'jsencrypt';
import qs from 'qs';
import { ElLoadingComponent } from 'element-ui/types/loading';

const HMACSHA256KEY = '1001';

function hashSHA256(params: Record<string, any>) {
    // 通过 hmacsha256 生成散列字符串
    return HmacSHA256(qs.stringify(params), HMACSHA256KEY).toString();
}
const excludes = ['/auth/management-system/get-public-key'];
const tokenExcludes = ['/auth/management-system'];
const allExcludes = ['/auth', '/admin'];

const isTokenExcludes = (url: string) => tokenExcludes.some((v) => new RegExp('^' + v).test(url));
let loading: ElLoadingComponent | null;
const defaultTimeout = 30000;
if (process.env.NODE_ENV !== 'development') {
    axios.defaults.baseURL = process.env.VUE_APP_API_URL;
}
axios.defaults.timeout = defaultTimeout;

axios.interceptors.request.use(
    async (config) => {
        if (!loading) {
            loading = Loading.service({
                target: '.my-el-container-loading',
                lock: true
            });
        }
        const { url } = config;
        if (url) {
            if (allExcludes.some((v) => new RegExp('^' + v).test(url))) {
                let params = config.params ?? {};
                let data = config.data ?? {};
                const _r = utils._r(1);
                const timestamp = Date.now().toString();
                const token = sessionStorage.getItem('token') ?? '';
                params._r = _r;
                params.timestamp = timestamp;
                params = formatParams(params);

                if (config.headers && config.headers['Content-Type'] !== 'multipart/form-data') {
                    data = formatParams(data);
                }

                config.params = params;
                config.data = data;
                if (!excludes.includes(url ?? '')) {
                    let Authorization: Record<string, any> = {};
                    Authorization = {
                        ...params,
                        ...data
                    };

                    if (!isTokenExcludes(url)) {
                        Authorization.authorization = token;
                        (config.headers ?? (config.headers = {}))['Authorization'] = token;
                    }

                    if (cfg.encrypt) {
                        Authorization = utils.ascllSort(Authorization);
                        // 获取保存的公钥
                        let pubKey = sessionStorage.getItem('public-key');
                        if (!pubKey) {
                            try {
                                pubKey = (
                                    await axios({
                                        url: '/auth/management-system/get-public-key',
                                        method: 'post'
                                    })
                                ).data.key;

                                sessionStorage.setItem('public-key', pubKey!);
                            } catch (e: any) {
                                pubKey = '';
                                throw new axios.Cancel(e.message);
                            }
                        }
                        if (pubKey) {
                            console.log(qs.stringify(Authorization));

                            //实例化 jsencrypt
                            const JSencrypt = new jsencrypt();
                            // 对实例化对象设置公钥
                            JSencrypt.setPublicKey(pubKey);
                            // 通过公钥对数据加密
                            const encrypt = JSencrypt.encrypt(hashSHA256(Authorization));
                            // 加密数据添加到请求头中
                            if (encrypt) {
                                config.params.sign = encrypt;
                            } else {
                                throw new axios.Cancel('参数加密错误');
                            }
                        }

                        // else处理 直接在/auth/management-system/get-public-key接口的res报错中处理好了
                    }
                }
            }
        }

        return config;
    },
    (err) => {
        loading?.close();
        loading = null;
        return Promise.reject(err);
    }
);

// 响应拦截
axios.interceptors.response.use(
    async (response) => {
        loading?.close();
        loading = null;
        if (allExcludes.some((v) => new RegExp('^' + v).test(response.config.url!))) {
            try {
                if (response.data.success === false) {
                    if (response.data.status === 1001) {
                        // token失效
                        sessionStorage.removeItem('token');
                        await ElementUI.MessageBox.alert('登录信息过期，请先登录', {
                            title: '提示',
                            type: 'error'
                        });
                        router.push('/login').then(() => void 0);
                        return Promise.reject(new Error(response.data.message));
                    }
                    throw new Error(response.data.message);
                }

                if (cfg.encrypt) {
                    if (!excludes.includes(response.config.url ?? '') && response.request.responseType !== 'blob') {
                        if (response.headers?.authorization) {
                            const { authorization } = response.headers;
                            const decrypt = HmacSHA256(
                                JSON.stringify(response.data.data ?? response.data),
                                HMACSHA256KEY
                            ).toString();
                            if (decrypt === authorization) {
                                return response.data;
                            } else {
                                throw new Error('数据被篡改了');
                            }
                        } else {
                            throw new Error('请设置参数加密响应头');
                        }
                    }
                }
                return response.data;
            } catch (err: any) {
                await MessageBox.alert(err.message, '错误', {
                    type: 'error'
                }).then(() => void 0);
                // router.push('/login').then(() => void 0);
                return Promise.reject(err);
            }
        } else {
            return response.data;
        }
    },
    (err) => {
        loading?.close();
        loading = null;
        if (err.config && isTokenExcludes(err.config.url)) {
            return Promise.reject(err);
        }
        if (err.message) {
            MessageBox.alert(err.message, '错误', {
                type: 'error'
            }).then(() => void 0);
        }
        return Promise.reject(err);
    }
);

export default axios;
