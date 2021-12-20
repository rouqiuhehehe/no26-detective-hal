import axios from '@/middleware/axios';

export default class {
    public static getUserInfo<T>() {
        return axios.get<T>('/auth/user-operation/get-user');
    }

    public static loginOut<T>() {
        return axios.post<T>('/auth/user-operation/login-out');
    }
}
