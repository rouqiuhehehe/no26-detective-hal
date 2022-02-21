import axios from '@/middleware/axios';

/**
 * 所有剧本
 */
export default class Workbench {
    public static getOperaList<T>(params: { types: string[] }) {
        return axios.get<T>('/admin/opera/opera-list', { params });
    }

    public static getOperaListView<T>(params: { types: string[] }) {
        return axios.get<T>('/admin/opera/opera-list/view', { params });
    }
}
