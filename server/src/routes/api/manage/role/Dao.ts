import BaseDao, { SortFields } from '@src/models/BaseDao';
import Util from '@util';
import redis from '@src/bin/redis';
import { RedisUser } from '@src/models/user';
import { socketRoleByIdMap } from '@src/models/webSocket';

export default class extends BaseDao {
    public table = 'n_manage_role';
    public primaryKey = 'n_role_id';
    public hasPagination = false;
    protected prefixField = 'n_role';
    protected formatDate = true;

    protected insertFields = {
        must: [
            'n_role_info',
            'n_role_name',
            'n_role_id',
            'n_role_create_user',
            'n_role_update_user',
            'n_role_create_time',
            'n_role_update_time'
        ],
        optional: []
    };

    protected listFields = ['n_role_info', 'n_role_name', 'n_role_id', 'n_role_create_time', 'n_role_update_time'];
    protected viewsFields = [
        'n_role_info',
        'n_role_name',
        'n_role_id',
        'n_role_create_user',
        'n_role_update_user',
        'n_role_create_time',
        'n_role_update_time'
    ];
    protected updateFields = ['n_role_info', 'n_role_name', 'n_update_time', 'n_update_user'];
    protected sortFields: SortFields[] = [
        {
            column: 'n_role_create_time',
            order: 'DESC'
        }
    ];

    private roleRelationFields = [
        'n_user_id',
        'n_role_id',
        'n_create_time',
        'n_update_time',
        'n_create_user',
        'n_update_user'
    ];

    public async addUser(roleId: string, userId: string[], uid: string) {
        const time = Util.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let sql = `INSERT INTO n_manage_role_relation (${this.roleRelationFields.toString()}) VALUES `;
        sql += userId.map((v) => `(${[v, roleId, time, time, uid, uid].map((v) => `'${v}'`).toString()})`);

        await this.db.beginTransaction(sql, this.checkTransactionRes(null, userId.length > 1, userId));
        await this.loginAlign(userId);
    }

    // 更改角色的用户需要重新登录
    private loginAlign(userId: string[]) {
        process.nextTick(async () => {
            await redis(async (client) => {
                for (const id of userId) {
                    const userInfo = (await client.hGetAll(`user:${id}`)) as unknown as RedisUser;

                    if (userInfo) {
                        socketRoleByIdMap.get(id)?.[1].emit('login-align');
                    }
                }
            });
        });
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
