import Db from '@src/bin/db';
import Util from '@util';
import { OkPacket } from 'mysql';

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

export const enum ActionType {
    INSERT = 'insert',
    LIST = 'list',
    DELETE = 'delete',
    UPDATE = 'update',
    VIEW = 'view',
    BULKVIEW = 'bulkView',
    BULKDELETE = 'bulkDelete',
    BULKUPDATE = 'bulkUpdate'
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
 */
export default abstract class BaseDao {
    public hasPagination = true;
    public abstract table: string;
    public abstract primaryKey: string;

    protected prefixField = '';
    protected abstract listFields: string[];
    protected sortFields: SortFields[] = [];
    protected abstract viewsFields: string[];

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

    protected insertFields: string[] = [];

    protected updateFields: string[] = [];

    public get camelizePrimaryKey() {
        return this.camelizeField(this.primaryKey);
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
                list,
                {
                    total,
                    page
                }
            ];
        } else {
            sql = await this.beforeAction(ActionType.LIST, params, sql);
            return db.asyncQueryBySock(this.getTableSock(ActionType.LIST), sql);
        }
    }

    // 插入方法
    public async insertRows(rows: Record<string, any> | Record<string, any>[]) {
        // 支持多条插入
        const hash = rows instanceof Array ? rows : [rows];
        let prevMap: any[] = [];

        const values = hash
            .map((v, i) => {
                const item = { ...v };
                const formatObj = this.deCamelizeObjectField(item);

                if (!formatObj) {
                    throw new Error('参数不能为空');
                }

                const valuesMap = Object.keys(formatObj).map((v) => {
                    if (!this.insertFields.includes(v)) {
                        throw new Error(`存在无效参数，请检查{${v}:${formatObj[v]}}`);
                    }
                    return `'${formatObj[v]}'`;
                });

                if (i !== 0 && prevMap.length !== valuesMap.length) {
                    throw new Error(
                        `批量参数数量不同，请检查对比参数${JSON.stringify(hash)}，${JSON.stringify(prevMap)}`
                    );
                }

                if (valuesMap.length !== this.insertFields.length) {
                    throw new Error(
                        `参数数量与insertFields长度不同，请检查参数${JSON.stringify(
                            hash
                        )}，insertFields：${JSON.stringify(this.insertFields)}`
                    );
                }
                prevMap = valuesMap;
                return `(${valuesMap.toString()})`;
            })
            .join(',');

        let sql = `insert into ${this.table} (${this.insertFields.toString()}) values ${values}`;

        sql = await this.beforeAction(ActionType.INSERT, hash, sql);

        return db.beginTransaction(sql);
    }

    // 删除方法
    public async deleteRows(primaryKey: string | number) {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }

        const [res] = await this.viewsRows(primaryKey);
        if (!res) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        let sql = `delete from ${this.table} where ${this.primaryKey} = ${primaryKey}`;

        sql = await this.beforeAction(ActionType.DELETE, primaryKey, sql);

        return db.beginTransaction(sql);
    }

    // 批量删除方法
    public async bulkDeleteRows(primaryKey: string[] | number[]) {
        if (!primaryKey.length) {
            throw new Error('缺少必填参数primaryKey');
        }

        const res = await this.bulkViewsRows(primaryKey);
        if (res.length !== primaryKey.length) {
            throw new Error(`不存在数据，请检查primaryKey: ${primaryKey}`);
        }

        let sql = `delete from ${this.table} where ${this.primaryKey} in (${primaryKey.toString()})`;

        sql = await this.beforeAction(ActionType.BULKDELETE, primaryKey, sql);

        return db.beginTransaction(sql);
    }

    // 修改方法
    public async updateRows(rows: Record<string, any> | Record<string, any>[]) {
        const primaryKey = rows[this.camelizePrimaryKey];
        if (!primaryKey) {
            throw new Error('缺少必传参数primaryKey');
        }

        const [res] = await this.viewsRows(primaryKey);
        if (!res) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        const columns = Object.keys(rows).reduce((a, v) => {
            if (v !== this.camelizePrimaryKey) {
                if (this.updateFields.includes(v)) {
                    a.push(`${v as string} = ${rows[v]}`);
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
    public async viewsRows(primaryKey: string | number): Promise<any[]> {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }
        const str = this.viewsFields.toString();
        if (!str) {
            throw new Error('请实现抽象数组viewsFields，进行查询字段');
        }
        let sql = `select ${str} from ${this.table} where ${this.primaryKey} = ${primaryKey}`;

        sql = await this.beforeAction(ActionType.VIEW, primaryKey, sql);
        return db.asyncQueryBySock(this.getTableSock(ActionType.VIEW), sql);
    }

    // 批量查询详情方法
    public async bulkViewsRows(primaryKey: string[] | number[]): Promise<any[]> {
        if (!primaryKey.length) {
            throw new Error('缺少必填参数primaryKey');
        }
        const str = this.viewsFields.toString();
        if (!str) {
            throw new Error('请实现抽象数组viewsFields，进行查询字段');
        }
        let sql = `select ${str} from ${this.table} where ${this.primaryKey} in (${primaryKey.toString()})`;

        sql = await this.beforeAction(ActionType.BULKVIEW, primaryKey, sql);
        return db.asyncQueryBySock(this.getTableSock(ActionType.BULKVIEW), sql);
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

                        sql = `${v} between ${start} and ${end}`;
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
                sql += ` ${orderFields}`;
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

    private deCamelizeObjectField(obj: Record<string, any>) {
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
    private deCamelizeField(str: string) {
        if (new RegExp(`^${this.prefixField}`).test(str)) {
            return str;
        }
        const reg = /[A-Z]/g;
        return `${this.prefixField}${str.replace(reg, (matched) => `_${matched.toLocaleLowerCase()}`)}`;
    }

    /**
     * 例：把 f_project_id 转换为 projectId
     */
    private camelizeField(rfieldName: string) {
        const fieldName = rfieldName.replace(/^f_/, '');
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
}
