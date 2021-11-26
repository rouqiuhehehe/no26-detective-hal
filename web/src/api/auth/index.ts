import axios from '@/middleware/axios';

export default class auth {
    public static getSalt<T>() {
        return axios.get<T>('/auth/management-system/get-salt');
    }

    public static getUserInfo<T>() {
        return axios.get<T>('/auth/management-system/get-user');
    }

    public static login<T>(params: { username: string; password: string }) {
        return axios.post<T>('/auth/management-system/login', params);
    }

    public static googleVerify<T>(params: { token: string }) {
        return axios.post<T>('/auth/management-system/verify-code', params);
    }
}
