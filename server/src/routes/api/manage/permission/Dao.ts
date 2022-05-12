import BaseDao from '@src/models/BaseDao';
import Util from '@util';
import { socketRoleByIdMap } from '@src/models/webSocket';
import redis from '@src/bin/redis';

export default class extends BaseDao {
    public table = 'n_permission';
    public primaryKey = 'n_permission_id';
    public hasPagination = false;
    protected prefixField = 'n_permission';
    protected formatDate = true;

    protected listFields = [
        'n_permission_id',
        'n_permission_name',
        'n_permission_route_id',
        'n_permission_menu_id',
        'n_permission_parent_menu_id',
        'n_permission_create_time',
        'n_permission_update_time'
    ];
    protected viewsFields = [];

    private permissionRelationFields = [
        'n_role_id',
        'n_permission_id',
        'n_create_time',
        'n_update_time',
        'n_create_user',
        'n_update_user'
    ];

    public async rolePermissionDao(roleId: string) {
        return this.db.asyncQuery<{ n_permission_id: string }[]>(
            'SELECT n_permission_id FROM n_permission_relation WHERE n_role_id = ?',
            roleId
        );
    }

    public async changeRolePermissionDao(roleId: string, permissionId: string[], userId: string) {
        const view = await this.viewRole(roleId);
        if (view.length && view.length === 1) {
            const delSql = 'DELETE FROM n_permission_relation WHERE n_role_id = ?';
            if (permissionId && permissionId.length) {
                await this.db.beginTransaction(
                    `${delSql};${this.getInsertSql(roleId, permissionId, userId)}`,
                    roleId,
                    async () => {
                        await this.refreshRoutes(roleId);
                    }
                );
            } else {
                await this.db.beginTransaction(delSql, roleId, async () => {
                    await this.refreshRoutes(roleId);
                });
            }
        } else {
            throw new Error(`未查询到该角色数据，请检查roleId：${roleId}`);
        }
    }

    private async refreshRoutes(roleId: string) {
        await redis(async (client, quit) => {
            for (const [uid, [token, socket]] of socketRoleByIdMap) {
                const { role } = await client.hGetAll(`user:${token}`);
                if (role.includes(roleId)) {
                    socket.emit('refresh-routes');
                }
            }
            await quit();
        });
    }

    private getInsertSql(roleId: string, permissionId: string[], userId: string) {
        const time = Util.getSQLTime();
        let insertSql = `INSERT INTO n_permission_relation (${this.permissionRelationFields.toString()}) VALUES `;
        insertSql += permissionId
            .map((v) => `('${roleId}', '${v}', '${time}', '${time}', '${userId}', '${userId}')`)
            .toString();
        return insertSql;
    }

    private async viewRole(roleId: string) {
        const sql = 'SELECT n_role_id FROM n_manage_role WHERE n_role_id = ?';
        return this.db.asyncQuery<{ n_role_id: string }[]>(sql, roleId);
    }

    // @Override
    // protected get hasPaginationBuilder() {
    //     return `SELECT
    //               a.uid,
    //               a.username,
    //               a.nickname,
    //               a.avatar,
    //               a.create_date,
    //               a.update_date,
    //               a.role,
    //               REPLACE(a.phone,'****',b.n_mask_label) as phone
    //             FROM
    //               user a
    //             LEFT JOIN n_phone_mask_relation b ON a.uid = b.n_id`;
    // }
}
