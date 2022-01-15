import axios from '@/middleware/axios';

/**
 * 工作台
 */
export default class Workbench {
    public static getOperaTypesCount<T>(params: { types: string[] }) {
        return axios.get<T>('/admin/workbench/get-opera-types-count', { params });
    }
}
