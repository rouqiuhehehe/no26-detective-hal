import axios from '@/middleware/axios';

interface UserListParams {
    username?: string;
    nickname?: string;
    phone?: number;
    id?: string;
}

export interface UserListType {
    avatar?: string;
    createDate: Date;
    nickname: string;
    phone?: string;
    uid: string;
    updateDate: Date;
    username: string;
}

export default class User {
    public static getUserList(params: UserListParams) {
        return axios.get<UserListType>('/api/manage/user', { params });
    }

    public static getNotAddUserList(params: UserListParams) {
        return axios.get<UserListType>('/api/manage/user/not-add', { params });
    }

    public static getUserListView<T>(params: { id: string }) {
        return axios.get<T>('/api/manage/user/view', { params });
    }

    public static deleteRoleUser(data: { id: string }) {
        return axios.post('/api/manage/user/delete', data);
    }
}
