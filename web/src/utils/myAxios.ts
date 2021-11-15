import { appReturnData, appReturnErrorData } from '@/types/store';
import FormatParams from '@/utils/formatParams';
import Axios, { AxiosRequestConfig } from 'axios';
import { Message, MessageBox } from 'element-ui';
import router from '../router/index';

export default function myAxios<T = any>(config: AxiosRequestConfig): Promise<appReturnData<T>> {
    return new Promise((resolve, reject) => {
        if (!config.url) {
            Message.error('No URL was passed');
            return;
        }
        const authToken = localStorage.getItem('authToken') ?? config.headers?.Authorization ?? '';

        const cfg: AxiosRequestConfig = {
            method: config.method,
            url: config.url,
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken ? 'Bearer ' + authToken : '',
                ...config.headers
            }
        };

        cfg.params = config.params ? FormatParams(config.params) : void 0;
        cfg.data = config.data ? FormatParams(config.data) : void 0;

        Axios(cfg)
            .then((res) => {
                const data: appReturnData<T> | appReturnErrorData<T> = res.data;
                if (data.status === 200) {
                    resolve(data as appReturnData<T>);
                } else if (data.status === 400) {
                    MessageBox.alert(
                        ((data as appReturnErrorData<T>).message as string) +
                            ', please enter OK and jump to login page',
                        'authToken error',
                        {
                            type: 'error',
                            callback(v) {
                                if (v === 'confirm') {
                                    router.push('/login');
                                }
                            }
                        }
                    );
                    reject(data);
                } else {
                    MessageBox.alert((data as appReturnErrorData<T>).message as string, 'Error', {
                        type: 'error'
                    });
                    reject(data);
                }
            })
            .catch((err) => {
                MessageBox.alert(err, 'Error', {
                    type: 'error'
                });

                reject(err);
            });
    });
}
