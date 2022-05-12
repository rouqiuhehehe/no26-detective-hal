import axios from '@/middleware/axios';
import Util from '@/utils';

export interface List {
    name: string;
    age: number;
    createDate: string;
    updateUser: string;
    createUser: string;
    id: string;
    updateDate: string;
}
export default class Test {
    public static getList(params: Record<string, any>) {
        return axios.get<List>('/api/test', { params });
    }

    public static getView(params: Record<string, any>) {
        return axios.get<List>('/api/test/view', { params });
    }

    public static add(data: Record<string, any>) {
        return axios.post('/api/test/insert', data);
    }

    public static del(data: Record<string, any>) {
        return axios.post('/api/test/delete', data);
    }

    public static edit(data: Record<string, any>) {
        return axios.post('/api/test/update', data);
    }

    public static bulkEdit(data: Record<string, any>[]) {
        return axios.post('/api/test/bulk-update', data);
    }

    public static bulkDel(data: Record<string, any>) {
        return axios.post('/api/test/bulk-delete', data);
    }

    public static export(data: Record<string, any>) {
        return Util.export('/api/test/export', data);
    }

    public static downloadImportTemplate() {
        return Util.export('/api/test/import-template-download');
    }

    public static import<T>(data: FormData, onUploadProgress: (event: any) => void) {
        return axios.post<T>('/api/test/import', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        });
    }
}
