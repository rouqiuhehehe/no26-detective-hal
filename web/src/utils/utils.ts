import Date from '@/utils/dateFormat';
import loadScript from './loadScript';
import _r from './_r';

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
}
