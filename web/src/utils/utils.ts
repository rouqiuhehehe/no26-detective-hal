import Date from '@/utils/dateFormat';
import { Md5 } from 'ts-md5';

export interface MyUtils {
    date: (dft: Date, format: string) => string;
    Md5: typeof Md5;
}

const myUtils: MyUtils = {
    date: Date,
    Md5
};

export default myUtils;
