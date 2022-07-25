import axios from '@/middleware/axios';

export interface UserInfo {
    nickname: string;
    avatar: string;
    create_date: string;
    username: string;
    permission: string;
    uid: string;
    update_date: string;
}

export default class Setting {
    public static getSettingUserInfo() {
        return axios.get<UserInfo>('/admin/setting/get-setting-user-info');
    }

    public static viewSettingUserInfo() {
        return axios.get<UserInfo>('/admin/setting/get-setting-user-info/view');
    }

    public static updateUserInfo<T>(params: { avatar: string; nickname: string; username: string }) {
        return axios.post<T>('/admin/setting/get-setting-user-info/update', params);
    }

    public static updateOperaList() {
        return axios.post<{ value: true }>('/admin/setting/get-setting-user-info/update-opera-list');
    }
}
