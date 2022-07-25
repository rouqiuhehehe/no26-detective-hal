import Date from '@/utils/dateFormat';
import loadScript from './loadScript';
import _r from './_r';
import { Message } from 'element-ui';
import Axios from 'axios';
import Vue from 'vue';

export enum DescriptorType {
    DATA = 'data',
    ACCESSOR = 'accessor',
    UNDEFINED = 'undefined'
}

const componentMap = new Map();
export default class Util {
    public static date = Date;
    public static _r = _r;
    public static loadScript = loadScript;

    public static async export(url: string, data?: Record<string, any>) {
        const res = await Axios.post(url, data, {
            responseType: 'blob'
        });
        Util.exportDownload(res.data, res.headers);
    }

    public static exportDownload(data: string, headers: Record<string, any>) {
        const head = headers['content-disposition'] || '';
        if (!head) {
            Message.error('无导出文件，请检查选择的是否正确');
            return;
        }
        let fileName = '';
        try {
            fileName = decodeURIComponent(head.split(';')[1].split('=')[1]);
        } catch (err) {
            fileName = '统计分析导出.xlsx';
        }
        const type = headers['content-type'];
        const blob = new Blob([data], { type });

        Util.downloadFile(fileName, blob);
    }

    public static ascllSort<T extends Record<string, any>>(obj: T) {
        const sortkeys = Object.keys(obj).sort();
        const newObj: Record<string, any> = {};

        for (const i of sortkeys) {
            newObj[i] = obj[i];
        }

        return newObj;
    }

    public static colorSpan(color: string, label: string) {
        return `<span style="color: ${color}">${label}</span>`;
    }

    public static isEmpty(obj: unknown) {
        if (typeof obj !== 'object') {
            return !obj;
        } else {
            for (const i in obj) {
                return false;
            }
            return true;
        }
    }

    public static downloadFile(filename: string, data: Blob) {
        const a = document.createElement('a');
        a.download = filename;
        const url = window.URL.createObjectURL(data);

        a.href = url;
        // 会生成一个类似blob:http://localhost:8080/d3958f5c-0777-0845-9dcf-2cb28783acaf 这样的URL字符串
        a.click();

        window.URL.revokeObjectURL(url);
    }

    public static deepClone(obj: any) {
        if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
            return obj;
        } else {
            const newObj: any = Array.isArray(obj) ? [] : {};
            if (obj && typeof obj === 'object') {
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        newObj[key] = Util.deepClone(obj[key]);
                    }
                }
            }
            return newObj;
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

    public static specialSymbolsRegExp() {
        return new RegExp('[`~!@#$^&*()=|{}"' + "'" + ':;,\\[\\].<>/?！￥…（）—【】‘；：”“。，、？]', 'g');
    }

    public static runFnComponent(me: any, key: any) {
        return (fn: any, ...arg: any[]) => {
            if (fn?.prototype instanceof Vue) {
                return fn;
            }
            if (typeof fn === 'function') {
                key = key ?? fn;
                const component = fn.call(me, ...arg);
                if (component?.prototype instanceof Vue) {
                    if (componentMap.has(key)) {
                        return componentMap.get(key);
                    }
                    componentMap.set(key, component);
                }
                return component;
            }

            return fn;
        };
    }

    public static clearComponent() {
        componentMap.clear();
    }

    // 判断浏览器函数
    // true为移动端，false为pc端
    public static isMobile() {
        return !!window.navigator.userAgent.match(
            /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
        );
    }
}
