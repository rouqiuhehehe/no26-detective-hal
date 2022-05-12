import axios from '@/middleware/axios';

export interface RoleList {
    name: string;
    info: string;
    id: string;
    createTime: Date;
    updateTime: Date;
}

interface viewRoleList extends RoleList {
    createUser: string;
    updateUser: string;
}

interface CreateRole {
    name: string;
    info: string;
}

export default class Role {
    public static getRoleList() {
        return axios.get<RoleList[]>('/api/manage/role');
    }

    public static createRole(data: CreateRole) {
        return axios.post('/api/manage/role/insert', data);
    }

    public static updateRole(data: CreateRole) {
        return axios.post('/api/manage/role/update', data);
    }

    public static viewRole(params: { id: string }) {
        return axios.get<viewRoleList>('/api/manage/role/view', { params });
    }

    public static deleteRole(data: { id: string }) {
        return axios.post('/api/manage/role/delete', data);
    }

    public static addUser(data: { roleId: string; userId: string[] }) {
        return axios.post('/api/manage/role/add-user', data);
    }
}
