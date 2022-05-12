import BaseHandler from '@src/models/BaseHandler';
import Dao from './Dao';
import Override from '@src/descriptor/Override';
import redis from '@src/bin/redis';

interface MenuTree {
    id: string;
    name: string;
    routeId: string | null;
    menuId: string;
    parentMenuId: string | null;
    createTime: Date;
    updateTime: Date;
    children?: MenuTree[];
}
const dao = new Dao();
export default class extends BaseHandler<Dao> {
    protected get dao() {
        return dao;
    }

    @Override
    public async listAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const result = await this.dao.getCountAndRows(req.query);
        const menuTree = this.getMenuTree(result as Omit<MenuTree, 'children'>[], null);
        res.success(menuTree);
    }

    public async rolePermissionAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const { roleId } = req.query;

        const result = await this.dao.rolePermissionDao(roleId as string);

        res.success(result.map((v) => v.n_permission_id));
    }

    public async changeRolePermissionAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const { roleId, permissionId } = req.body;
        const { uid: userId } = req.user;

        await this.dao.changeRolePermissionDao(roleId, permissionId ?? [], userId!);
        const token = req.header('authorization')?.replace('Bearer ', '');
        await redis(async (client) => {
            await client.del(`user:web-routes:${token}`);
        });

        res.success();
    }

    private getMenuTree(result: Omit<MenuTree, 'children'>[], pid: string | null) {
        return result.reduce((a, v) => {
            if (v.parentMenuId === pid) {
                const children = this.getMenuTree(result, v.menuId);
                if (children && children.length) {
                    a.push({
                        ...v,
                        children
                    });
                } else {
                    a.push(v);
                }
            }
            return a;
        }, [] as MenuTree[]);
    }
}
