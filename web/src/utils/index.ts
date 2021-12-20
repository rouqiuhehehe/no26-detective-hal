import Date from '@/utils/dateFormat';
import loadScript from './loadScript';
import _r from './_r';

export enum DescriptorType {
    DATA = 'data',
    ACCESSOR = 'accessor',
    UNDEFINED = 'undefined'
}

export default class utils {
    public static date = Date;
    public static ascllSort<T extends Record<string, any>>(obj: T) {
        const sortkeys = Object.keys(obj).sort();
        const newObj: Record<string, any> = {};

        for (const i of sortkeys) {
            newObj[i] = obj[i];
        }

        return newObj;
    }

    public static _r = _r;

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

    public static loadScript = loadScript;

    public static deepClone(obj: any) {
        if (typeof obj !== 'object') {
            return obj;
        } else {
            const newObj: any = Array.isArray(obj) ? [] : {};
            if (obj && typeof obj === 'object') {
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        newObj[key] = utils.deepClone(obj[key]);
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
        const fnType = utils.getFunctionTypeByDescriptor(descriptor);

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
}
