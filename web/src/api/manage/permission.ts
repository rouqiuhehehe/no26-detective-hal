import axios from '@/middleware/axios';

export interface MenuTree {
    id: string;
    name: string;
    routeId: string | null;
    menuId: string;
    parentMenuId: string | null;
    createTime: Date;
    updateTime: Date;
    children?: MenuTree[];
}

interface ListParams extends Pagination {
    role: string;
}
export default class Permission {
    public static getPermissionList(params: ListParams) {
        return axios.get<MenuTree[]>('/api/manage/permission', { params });
    }

    public static getRolePermissionList(params: { roleId: string }) {
        return axios.get<string[]>('/api/manage/permission/role-permission', { params });
    }

    public static changeRolePermission(data: { permissionId: string[]; roleId: string }) {
        return axios.post('/api/manage/permission/change-role-permission', data);
    }
}
