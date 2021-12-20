import axios from '@/middleware/axios';

export default class {
    public static getRoutes<T>() {
        return axios.get<T>('/admin/routes/get-web-routes');
    }
}
