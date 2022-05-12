import BaseDao, { ActionType, Pagination, QueryCondition, SortFields } from '@src/models/BaseDao';
import Override from '@src/descriptor/Override';
import Util from '@util';
import { OkPacket, PoolConnection } from 'mysql';
import redis from '@src/bin/redis';
import { RedisUser } from '@src/models/user';
import { socketRoleByIdMap } from '@src/models/webSocket';

export interface UserListType {
    avatar?: string;
    createDate: Date;
    nickname: string;
    phone?: string;
    uid: string;
    updateDate: Date;
    username: string;
}
export default class extends BaseDao {
    public table = 'user';
    public primaryKey = 'uid';
    protected formatDate = true;
    protected listFields = ['uid', 'username', 'nickname', 'avatar', 'create_time', 'update_time', 'phone'];
    protected viewsFields = ['uid', 'username', 'nickname', 'avatar', 'create_time', 'update_time', 'phone'];
    protected sortFields: SortFields[] = [
        {
            column: 'create_time',
            order: 'DESC'
        }
    ];

    // 特殊查询字段
    protected queryCondition: QueryCondition = {
        // 模糊查询
        match: ['username', 'nickname'],
        // 时间，值传[start, end]数组
        time: ['n_create_time', 'n_update_time'],
        // find_in_set，值传数组
        findInSet: ['role'],
        // in语法，值传数组
        whereIn: [],
        defaultMatch: []
    };

    @Override
    protected get hasPaginationBuilder() {
        return `select SQL_CALC_FOUND_ROWS ${this.listFields
            .map((v) => `c.${v}`)
            .toString()} from (SELECT a.*, GROUP_CONCAT(b.n_role_id) as role FROM ${
            this.table
        } a RIGHT JOIN n_manage_role_relation b ON a.uid = b.n_user_id GROUP BY a.uid) c`;
    }

    @Override
    protected get viewBuilder() {
        return `
            SELECT
                a.uid,
                a.username,
                a.nickname,
                a.avatar,
                a.password,
                a.create_time,
                a.update_time,
                GROUP_CONCAT( b.n_role_id ) AS role,
                GROUP_CONCAT( c.n_role_name ) AS roleValue,
                REPLACE ( a.phone, '****', d.n_mask_label ) AS phone 
            FROM
                user a
                RIGHT JOIN n_manage_role_relation b ON a.uid = b.n_user_id
                LEFT JOIN n_manage_role c ON b.n_role_id = c.n_role_id
                LEFT JOIN n_phone_mask_relation d ON d.n_id = a.uid 
            GROUP BY
                b.n_user_id
            HAVING
                a.uid = ?
        `;
    }

    @Override
    protected get deleteBuilder() {
        return `DELETE FROM n_manage_role_relation WHERE n_user_id = ? and n_role_id = ?`;
    }

    private get getNotAddUserBuilder() {
        return `select SQL_CALC_FOUND_ROWS ${this.listFields.map((v) => `c.${v}`).toString()} FROM (select a.* from ${
            this.table
        } a WHERE a.uid NOT IN (SELECT b.n_user_id FROM n_manage_role_relation b WHERE b.n_role_id = ?)) c`;
    }

    @Override
    public async deleteRows(primaryKey: string, body: Record<string, any>) {
        const { roleId } = body;
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }

        const res = await this.viewsRows(primaryKey);
        if (Util.isEmpty(res)) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        let sql = this.deleteBuilder;

        sql = await this.beforeAction(ActionType.DELETE, primaryKey, sql);

        return this.db.beginTransaction<OkPacket>(
            sql,
            [primaryKey, roleId],
            this.checkTransactionRes(ActionType.DELETE, false, primaryKey)
        );
    }

    public async getNotAddUser(params: Record<string, any>, roleId: string) {
        const { limit = 10, page = 1, sort, ...otherParams } = params;
        let sql = this.getNotAddUserBuilder;

        const order = this.generateSortFields(sort);
        sql += this.getCountAndRowsBuilder(otherParams);
        if (order) {
            sql += ` order by ${order}`;
        }

        // tslint:disable:no-parameter-reassignment
        sql += ` ${this.paginationSql(limit, page)}`;
        sql += ';SELECT FOUND_ROWS();';

        sql = await this.beforeAction(ActionType.LIST, params, sql);
        const [list, [{ 'FOUND_ROWS()': total }]] = await this.db.asyncQueryBySock(
            this.getTableSock(ActionType.LIST),
            sql,
            [roleId]
        );
        const data: [UserListType[], Pagination] = [
            this.formatQueryList(list) as UserListType[],
            {
                total,
                page: +page,
                limit: +limit
            }
        ];
        return data;
    }

    @Override
    protected async afterAction(type: ActionType, data: string, _conn?: PoolConnection) {
        if (type === ActionType.DELETE) {
            this.loginAlign([data]);
        }
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
        })
    }
}
