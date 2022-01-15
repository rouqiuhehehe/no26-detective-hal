import axios from '@/middleware/axios';

/**
 * 字典集
 */
export default class Dictionary {
    /**
     * 获取所有剧本类型
     */
    public static getOperaTypes<T>() {
        return axios.get<T>('/admin/dictionary/get-opera-types');
    }

    /**
     * 上传图片接口
     */
    public static uploadImg(params: FormData, onUploadProgress: (event: any) => void) {
        return axios.post<{ url: string }>('/admin/dictionary/upload/img', params, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        });
    }

    /**
     * 下载文件接口
     * @param filename 文件md5名
     */
    public static downloadFile(params: { filename: string }) {
        return axios.post<Blob>('/admin/dictionary/download', params, {
            responseType: 'blob'
        });
    }
}