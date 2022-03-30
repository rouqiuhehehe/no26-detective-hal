import Db from '@src/bin/db';
import Util from '@util';
import { OkPacket } from 'mysql';
import { v4 } from 'uuid';

export interface SortFields {
    order: 'ASC' | 'DESC';
    column: string;
}

export interface QueryCondition {
    match: string[];
    time: string[];
    findInSet: string[];
    whereIn: string[];
    defaultMatch: string[];
}

export interface Pagination {
    total: number;
    page: number;
}

export interface MustAndOptionalParams {
    must: string[];
    optional: string[];
}

export const enum ActionType {
    INSERT,
    LIST,
    DELETE,
    UPDATE,
    VIEW,
    BULKVIEW,
    BULKDELETE,
    BULKUPDATE
}

const db = new Db();
/**
 * table 表
 * primaryKey 主键，
 * listFileds 查询列表需要返回的字段
 * insertFields 插入字段
 * prefixField 如果表格携带前缀，比如f_name，可以配置'f_'前缀
 * sortFields 排序字段，如需排序，请重写
 * hasPagination 查询是否携带分页，默认为true
 * formatDate 是否需要格式化日期字段，默认为false
 */
export default abstract class BaseDao {
    public hasPagination = true;
    public abstract table: string;
    public abstract primaryKey: string;

    protected prefixField = '';
    protected abstract listFields: string[];
    protected sortFields: SortFields[] = [];
    protected abstract viewsFields: string[];
    protected formatDate = false;

    // 特殊查询字段
    protected queryCondition: QueryCondition = {
        // 模糊查询
        match: [],
        // 时间，值传[start, end]数组
        time: [],
        // find_in_set，值传数组
        findInSet: [],
        // in语法，值传数组
        whereIn: [],
        defaultMatch: []
    };

    protected insertFields: MustAndOptionalParams = {
        must: [],
        optional: []
    };

    protected updateFields: string[] = [];

    // 后台特殊生成字段，校验参数会排除的字段集
    private specialFields = ['updateUser', 'createUser', 'updateTime', 'createTime'];

    public get camelizePrimaryKey() {
        return this.camelizeField(this.primaryKey);
    }

    protected get db() {
        return db;
    }

    protected get builder() {
        return `select ${this.listFields.toString()} from ${this.table} `;
    }

    protected get hasPaginationBuilder() {
        return `select SQL_CALC_FOUND_ROWS ${this.listFields.toString()} from ${this.table} `;
    }

    // 查询总数和当前页
    public async getCountAndRows<T = Record<string, any>>(
        params: Record<string, any>
    ): Promise<T[] | [T[], Pagination]> {
        const { limit = 10, page = 1, ...otherParams } = params;
        let sql;
        if (this.hasPagination) {
            sql = this.hasPaginationBuilder;
        } else {
            sql = this.builder;
        }

        const order = this.generateSortFields();
        sql += this.getCountAndRowsBuilder(otherParams, limit, page, order);

        if (this.hasPagination) {
            sql += ';SELECT FOUND_ROWS();';

            sql = await this.beforeAction(ActionType.LIST, params, sql);
            const [list, [{ 'FOUND_ROWS()': total }]] = await db.asyncQueryBySock(
                this.getTableSock(ActionType.LIST),
                sql
            );

            return [
                this.formatQueryList(list) as T[],
                {
                    total,
                    page
                }
            ];
        } else {
            sql = await this.beforeAction(ActionType.LIST, params, sql);
            const list = await db.asyncQueryBySock(this.getTableSock(ActionType.LIST), sql);
            return this.formatQueryList(list as T[]) as T[];
        }
    }

    // 插入方法
    public async insertRows(rows: Record<string, any> | Record<string, any>[], userId?: string) {
        // 支持多条插入
        const [hash, isBulk] = rows instanceof Array ? [rows, true] : [[rows], false];
        const values = hash
            .map((v) => {
                if (!v) {
                    throw new Error('参数不能为空');
                }
                const item = this.generateCreateData(v, userId);
                const formatObj = this.deCamelizeObjectField(item)!;
                const keys = Object.keys(formatObj);

                // 区分开必填参数和选填参数
                const arr = [[], new Array(this.insertFields.optional.length).fill('default')];
                keys.reduce((a, v) => {
                    const mustIndex = this.insertFields.must.indexOf(v);
                    const optionalIndex = this.insertFields.optional.indexOf(v);
                    if (mustIndex !== -1) {
                        a[0][mustIndex] = `'${formatObj[v]}'`;
                    } else if (optionalIndex !== -1) {
                        a[1][optionalIndex] = `'${formatObj[v]}'`;
                    } else {
                        throw new Error(`存在无效参数，请检查{${this.camelizeField(v)}:${formatObj[v]}}`);
                    }
                    return a;
                }, arr);

                if (arr[0].length !== this.insertFields.must.length) {
                    throw new Error(
                        `必填参数数量与insertFields的必填参数数量不同，请检查参数${JSON.stringify(
                            hash
                        )}，insertFields：${JSON.stringify(
                            this.insertFields.must
                                .map((v) => this.camelizeField(v))
                                .filter((v) => !this.specialFields.includes(v) && this.camelizePrimaryKey !== v)
                        )}`
                    );
                }
                return `(${arr.flat(1).toString()})`;
            })
            .join(',');

        let sql = `insert into ${this.table} (${[
            ...this.insertFields.must,
            ...this.insertFields.optional
        ].toString()}) values ${values}`;

        sql = await this.beforeAction(ActionType.INSERT, hash, sql);

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(isBulk, hash));
    }

    // 删除方法
    public async deleteRows(primaryKey: string | number) {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }

        const res = await this.viewsRows(primaryKey);
        if (Util.isEmpty(res)) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        let sql = `delete from ${this.table} where ${this.primaryKey} = '${primaryKey}'`;

        sql = await this.beforeAction(ActionType.DELETE, primaryKey, sql);

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(false, primaryKey));
    }

    // 批量删除方法
    public async bulkDeleteRows(primaryKey: string[] | number[]) {
        this.checkPrimaryKeyIsEmptyArray(primaryKey);

        const res = await this.bulkViewsRows(primaryKey);
        if (res.length !== primaryKey.length) {
            throw new Error(
                `不存在数据，请检查primaryKey: ${(primaryKey as any[]).filter(
                    (v) => !res.some((item) => v === item[this.camelizePrimaryKey])
                )}`
            );
        }

        let sql = `delete from ${this.table} where ${this.primaryKey} in (${primaryKey
            .map((v) => `'${v}'`)
            .toString()})`;

        sql = await this.beforeAction(ActionType.BULKDELETE, primaryKey, sql);

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(true, primaryKey));
    }

    // 修改方法
    public async updateRows(rows: Record<string, any> | Record<string, any>[]) {
        const primaryKey = rows[this.camelizePrimaryKey];
        if (!primaryKey) {
            throw new Error('缺少必传参数primaryKey');
        }

        const res = await this.viewsRows(primaryKey);
        if (!res) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        const body = this.generateUpdateData(rows);

        const columns = Object.keys(body).reduce((a, v) => {
            if (v !== this.camelizePrimaryKey) {
                const key = this.deCamelizeField(v);
                if (this.updateFields.includes(key)) {
                    a.push(`${key} = ${rows[v]}`);
                } else {
                    throw new Error(`存在未知修改字段，请检查${v}: ${rows[v]}`);
                }
            }

            return a;
        }, [] as string[]);

        if (!columns.length) {
            throw new Error(`不存在修改字段，请检查传入参数rows: ${JSON.stringify(rows)}`);
        }

        let sql = `update ${this.table} set ${columns.toString()} where ${this.primaryKey} = ${primaryKey}`;

        sql = await this.beforeAction(ActionType.UPDATE, rows, sql);

        return db.beginTransaction<OkPacket>(sql, (res) => {
            if (res.changedRows !== 1) {
                throw new Error(`修改数据库数据条数有误，请检查传入参数rows: ${JSON.stringify(rows)}`);
            }
        });
    }

    // 批量修改，req.body传数组
    public async bulkUpdateRows(rows: Record<string, any>[]) {
        const primaryKeys = rows.map((v) => v[this.camelizePrimaryKey]);
        if (!primaryKeys.length) {
            throw new Error('缺少必传参数primaryKey');
        }

        const res = await this.bulkViewsRows(primaryKeys);
        if (res.length !== primaryKeys.length) {
            throw new Error(`不存在数据，请检查primaryKeys: ${primaryKeys}`);
        }

        let sql = `update ${this.table} set ${this.formatBulkUpdateRow(rows)} where ${
            this.primaryKey
        } in (${primaryKeys.toString()})`;

        sql = await this.beforeAction(ActionType.BULKUPDATE, rows, sql);

        return db.beginTransaction<OkPacket>(sql, (res) => {
            const { changedRows } = res;

            if (changedRows !== primaryKeys.length) {
                throw new Error(`事务修改rows条目数，与传入数量长度不同，请检查参数${rows}，改变数量: ${changedRows}`);
            }
        });
    }

    // 详情方法
    public async viewsRows(primaryKey: string | number): Promise<Record<string, any>> {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }
        const str = this.viewsFields.toString();
        if (!str) {
            throw new Error('请实现抽象数组viewsFields，进行查询字段');
        }
        let sql = `select ${str} from ${this.table} where ${this.primaryKey} = "${primaryKey}"`;

        sql = await this.beforeAction(ActionType.VIEW, primaryKey, sql);
        const [res] = await db.asyncQueryBySock(this.getTableSock(ActionType.VIEW), sql);
        return this.formatQueryView(res) ?? {};
    }

    // 批量查询详情方法
    public async bulkViewsRows<T extends Object>(primaryKey: string[] | number[]): Promise<any[]> {
        this.checkPrimaryKeyIsEmptyArray(primaryKey);
        const str = this.viewsFields.toString();
        if (!str) {
            throw new Error('请实现抽象数组viewsFields，进行查询字段');
        }
        let sql = `select ${str} from ${this.table} where ${this.primaryKey} in (${primaryKey
            .map((v) => `'${v}'`)
            .toString()})`;

        sql = await this.beforeAction(ActionType.BULKVIEW, primaryKey, sql);
        const res = await db.asyncQueryBySock<T[]>(this.getTableSock(ActionType.BULKVIEW), sql);
        return this.formatQueryList(res);
    }

    // 查询语句生成，复杂语句请重写此方法
    protected getCountAndRowsBuilder(params: Record<string, any>, limit: number, page: number, orderFields?: string) {
        const reqParams = { ...params };
        const { match, whereIn, findInSet, time, defaultMatch } = this.queryCondition;
        if (reqParams) {
            let sql: string[] | string = Object.keys(reqParams).reduce((a, key) => {
                const value = reqParams[key];
                const v = this.deCamelizeField(key);
                let sql;
                if (value !== undefined && value !== null && value !== '') {
                    if (match && match.length && match.includes(v)) {
                        sql = `${v} like '%${value}%'`;
                    } else if (whereIn && whereIn.length && whereIn.includes(v)) {
                        sql = this.whereInSql(v, value);
                    } else if (findInSet && findInSet.length && findInSet.includes(v)) {
                        sql = this.findInSetSql(v, value);
                    } else if (time && time.length && time.includes(v)) {
                        const [start, end] = value;

                        sql = `${v} between '${start}' and '${end}'`;
                    } else if (defaultMatch && defaultMatch.length && defaultMatch.includes(v)) {
                        sql = `${v} = ${value}`;
                    }
                }

                if (sql) {
                    a.push(sql);
                }
                return a;
            }, [] as string[]);
            if (sql.length) {
                sql = `where ${sql.join(' and ')}`;
            }

            if (orderFields) {
                sql += ` order by ${orderFields}`;
            }

            // tslint:disable:no-parameter-reassignment
            if (this.hasPagination) {
                limit = limit ?? 10;
                page = page ?? 1;

                if (limit && page) {
                    sql += ` ${this.paginationSql(limit, page)}`;
                }
            }

            return sql;
        }
    }

    // 操作前置钩子，如需使用钩子请重写此方法
    protected async beforeAction(_type: ActionType, _data: any, sql: string): Promise<string> {
        return sql;
    }

    // 生成排序语句，如果需要排序，请重写sortFields
    protected generateSortFields() {
        return this.sortFields.map((v) => `${v.column} ${v.order}`).toString();
    }

    protected paginationSql(limit = 10, page = 1) {
        return `limit ${(+page - 1) * +limit},${limit}`;
    }

    protected whereInSql(field: string, value: (string | number)[]) {
        return `${field} in ${value.toString()}`;
    }

    protected findInSetSql(field: string, value: (string | number)[]) {
        return value.map((v) => `find_in_set(${v}, ${field})`).join(' and ');
    }

    protected getTableSock(action: ActionType) {
        return `${this.table}_${this.primaryKey}:${action}`;
    }

    protected formatBulkUpdateRow(primaryKeys: Record<string, any>[]) {
        const obj: Record<string, string[]> = {};
        primaryKeys.reduce((a, v) => {
            Object.keys(v).forEach((item) => {
                if (item !== this.camelizePrimaryKey) {
                    if (!a[item]) {
                        a[item] = [];
                    }
                    if (this.updateFields.includes(item)) {
                        a[item].push(`when ${v[this.camelizePrimaryKey]} then '${v[item]}'`);
                    } else {
                        throw new Error(`存在未知修改字段，请检查传入参数${item}: ${v[item]}`);
                    }
                }
            });
            return a;
        }, obj);

        return Object.keys(obj)
            .reduce((a, v) => {
                a.push(`${v} = case ${this.primaryKey} ${obj[v].join(' ')} end`);
                return a;
            }, [] as string[])
            .toString();
    }

    protected deCamelizeObjectField(obj: Record<string, any>) {
        if (!obj || Util.isEmpty(obj)) {
            return null;
        }
        const newObj: Record<string, any> = {};
        return Object.keys(obj).reduce((a, v) => {
            a[this.deCamelizeField(v)] = obj[v];
            return a;
        }, newObj);
    }

    /**
     * 例：把 projectId 转换为 f_project_id
     * 会把驼峰式转成下划线式命名
     */
    protected deCamelizeField(str: string) {
        if (new RegExp(`^${this.prefixField}_`).test(str)) {
            return str;
        }
        const reg = /[A-Z]/g;
        return `${this.prefixField}_${str.replace(reg, (matched) => `_${matched.toLocaleLowerCase()}`)}`;
    }

    protected camelizeObjectField(obj: Record<string, any>) {
        if (!obj || Util.isEmpty(obj)) {
            return null;
        }
        const newObj: Record<string, any> = {};
        return Object.keys(obj).reduce((a, v) => {
            a[this.camelizeField(v)] = obj[v];
            return a;
        }, newObj);
    }

    /**
     * 例：把 f_project_id 转换为 projectId
     */
    protected camelizeField(rfieldName: string) {
        const fieldName = rfieldName.replace(new RegExp(`^${this.prefixField}_`), '');
        const arr = fieldName.split('_');
        return arr
            .map((item, index) => {
                if (index === 0 || item.length === 0) {
                    return item;
                }
                return item[0].toUpperCase() + item.slice(1);
            })
            .join('');
    }

    private generateCreateData(data: Record<string, any>, userId?: string) {
        const body = {
            ...data
        };
        if (this.insertFields.must.includes(this.deCamelizeField('createUser'))) {
            if (!userId) {
                throw new Error('userID 不能为空');
            }
            body.createUser = userId;
        }
        if (this.insertFields.must.includes(this.deCamelizeField('updateUser'))) {
            if (!userId) {
                throw new Error('userID 不能为空');
            }
            body.updateUser = userId;
        }
        if (this.insertFields.must.includes(this.deCamelizeField('updateTime'))) {
            body.updateTime = Util.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        }
        if (this.insertFields.must.includes(this.deCamelizeField('createTime'))) {
            body.createTime = Util.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        }
        body[this.camelizePrimaryKey] = v4();
        return body;
    }

    private generateUpdateData(data: Record<string, any>, userId?: string) {
        const body = {
            ...data
        };
        if (this.updateFields.includes(this.deCamelizeField('updateUser'))) {
            if (!userId) {
                throw new Error('userID 不能为空');
            }
            body.updateUser = userId;
        }
        if (this.updateFields.includes(this.deCamelizeField('updateTime'))) {
            body.updateTime = Util.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
        }
        return body;
    }

    private formatQueryList<T>(list: T[]) {
        return list.map((v) => this.formatQueryView(v));
    }

    private formatQueryView<T>(obj: T) {
        if (!obj) {
            return null;
        }

        const result = this.camelizeObjectField(obj);
        if (this.formatDate && result) {
            const { createTime, updateTime } = result;
            createTime && (result.createTime = Util.dateFormat(createTime, 'yyyy-MM-dd HH:mm:ss'));
            updateTime && (result.updateTime = Util.dateFormat(updateTime, 'yyyy-MM-dd HH:mm:ss'));
        }
        return result;
    }

    private checkPrimaryKeyIsEmptyArray(primaryKey: string[] | number[]) {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }
        // noinspection SuspiciousTypeOfGuard
        if (!(primaryKey instanceof Array)) {
            throw new Error('参数primaryKey请传入数组');
        }

        if (!primaryKey.length) {
            throw new Error('缺少必填参数primaryKey');
        }
    }

    private checkTransactionRes(isBulk: boolean, rows: any | any[]) {
        return (res: OkPacket) => {
            if (isBulk) {
                const { affectedRows } = res;

                if (affectedRows !== rows.length) {
                    throw new Error(
                        `事务修改rows条目数，与传入数量长度不同，请检查参数${JSON.stringify(
                            rows
                        )}，改变数量: ${affectedRows}`
                    );
                }
            } else {
                if (res.affectedRows !== 1) {
                    throw new Error(`修改数据库数据条数有误，请检查传入参数rows: ${JSON.stringify(rows)}`);
                }
            }
        };
    }
}
