import Db from '@src/bin/Db';
import Util from '@util';
import mysql, { OkPacket } from 'mysql';
import { v4 } from 'uuid';
import nodeXlsx from 'node-xlsx';

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
    limit: number;
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
 * exportHeader 导出字段头
 * exportName 导出文件名
 * importTemplateDownloadName 导入模板下载文件名
 * importTemplateDownloadHeader 导入模板的字段注释
 * importHeader 导入字段头
 * needToArrayFields 返回时需要转成数组的字段
 */
export default abstract class BaseDao {
    public get camelizePrimaryKey() {
        return this.camelizeField(this.primaryKey);
    }

    /**
     * 导出文件名，默认为exportName+时间，自定义请重写此方法
     */
    public get getExportName() {
        return `${this.exportName}-${Util.dateFormat(new Date(), 'yyyy-MM-dd_HH:mm:ss')}.xlsx`;
    }

    public get getImportTemplateDownloadName() {
        return this.importTemplateDownloadName;
    }

    protected get db() {
        return db;
    }

    public get camelizeNeedToArrayFields() {
        return this.needToArrayFields.map((v) => this.camelizeField(v));
    }

    protected get builder() {
        return `select ${this.listFields.toString()} from ${this.table}`;
    }

    protected get hasPaginationBuilder() {
        return `select SQL_CALC_FOUND_ROWS ${this.listFields.toString()} from ${this.table}`;
    }

    protected get viewBuilder() {
        return `select ${this.viewsFields.toString()} from ${this.table} where ${this.primaryKey} = ?`;
    }

    protected get deleteBuilder() {
        return `delete from ${this.table} where ${this.primaryKey} = ?`;
    }

    public hasPagination = true;
    public abstract table: string;
    public abstract primaryKey: string;
    public needToArrayFields: string[] = [];

    protected prefixField = '';
    protected abstract listFields: string[];
    protected sortFields: SortFields[] = [];
    protected abstract viewsFields: string[];
    protected formatDate = false;

    protected importHeader: { key: string; label: string }[] = [];
    protected importTemplateDownloadName = '';
    protected importTemplateDownloadHeader: {
        label: string;
        comment: string;
    }[] = [];
    protected exportName = '';
    protected exportHeader: { key: string; label: string }[] = [];

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

    // or连接符，查并集，目前只支持find_in_set
    protected orWhere: string[] = [];

    protected insertFields: MustAndOptionalParams = {
        must: [],
        optional: []
    };

    protected updateFields: string[] = [];

    // 后台特殊生成字段，校验参数会排除的字段集
    private specialFields = ['updateUser', 'createUser', 'updateTime', 'createTime'];

    // 查询总数和当前页
    public async getCountAndRows<T = Record<string, any>>(
        params: Record<string, any>,
        ids?: string[]
    ): Promise<T[] | [T[], Pagination]> {
        const { limit = 10, page = 1, sort, ...otherParams } = params;
        let sql;
        if (this.hasPagination) {
            sql = this.hasPaginationBuilder;
        } else {
            sql = this.builder;
        }

        const order = this.generateSortFields(sort);
        sql += this.getCountAndRowsBuilder(otherParams, ids);
        if (order) {
            sql += ` order by ${order}`;
        }

        // tslint:disable:no-parameter-reassignment
        if (this.hasPagination) {
            if (limit && page) {
                sql += ` ${this.paginationSql(limit, page)}`;
            }
        }
        if (this.hasPagination) {
            sql += ';SELECT FOUND_ROWS();';

            sql = await this.beforeAction(ActionType.LIST, params, sql);
            const [list, [{ 'FOUND_ROWS()': total }]] = await db.asyncQueryBySock(
                this.getTableSock(ActionType.LIST),
                sql
            );
            const data: [T[], Pagination] = [
                this.formatQueryList(list) as T[],
                {
                    total,
                    page: +page,
                    limit: +limit
                }
            ];
            await this.afterAction(ActionType.LIST, data);
            return data;
        } else {
            sql = await this.beforeAction(ActionType.LIST, params, sql);
            const list = await db.asyncQueryBySock(this.getTableSock(ActionType.LIST), sql);
            const data = this.formatQueryList(list as T[]) as T[];
            await this.afterAction(ActionType.LIST, data);
            return data;
        }
    }

    // 插入方法
    public async insertRows(rows: Record<string, any> | Record<string, any>[], userId?: string) {
        // 支持多条插入
        const [hash, isBulk] = rows instanceof Array ? [rows, true] : [[rows], false];
        const sqlHash: Record<string, any>[] = [];
        const values = hash
            .map((v) => {
                if (Util.isEmpty(v)) {
                    throw new Error('参数不能为空');
                }
                const item = this.generateCreateData(v, userId);
                const formatObj = this.deCamelizeObjectField(item)!;
                const keys = Object.keys(formatObj);
                sqlHash.push(formatObj);
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

        sql = await this.beforeAction(ActionType.INSERT, sqlHash, sql);

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(ActionType.INSERT, isBulk, sqlHash));
    }

    // 删除方法
    public async deleteRows(primaryKey: string, _body: Record<string, any>) {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }

        const res = await this.viewsRows(primaryKey);
        if (Util.isEmpty(res)) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        let sql = this.deleteBuilder;

        sql = await this.beforeAction(ActionType.DELETE, primaryKey, sql);

        return db.beginTransaction<OkPacket>(
            sql,
            primaryKey,
            this.checkTransactionRes(ActionType.DELETE, false, primaryKey)
        );
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

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(ActionType.BULKDELETE, true, primaryKey));
    }

    // 修改方法
    public async updateRows(rows: Record<string, any> | Record<string, any>[], userId?: string) {
        const primaryKey = rows[this.camelizePrimaryKey];
        if (!primaryKey) {
            throw new Error('缺少必传参数primaryKey');
        }

        const res = await this.viewsRows(primaryKey);
        if (!res) {
            throw new Error(`不存在此数据，请检查primaryKey: ${primaryKey}`);
        }

        const body = this.generateUpdateData(rows, userId);
        const sqlHash: Record<string, any> = {
            [this.camelizePrimaryKey]: primaryKey
        };

        const columns = Object.keys(body).reduce((a, v) => {
            if (v !== this.camelizePrimaryKey) {
                const key = this.deCamelizeField(v);
                if (this.updateFields.includes(key)) {
                    sqlHash[key] = body[v];
                    a.push(`${key} = '${body[v]}'`);
                } else {
                    throw new Error(`存在未知修改字段，请检查${v}: ${rows[v]}`);
                }
            }

            return a;
        }, [] as string[]);

        if (!columns.length) {
            throw new Error(`不存在修改字段，请检查传入参数rows: ${JSON.stringify(rows)}`);
        }

        let sql = `update ${this.table} set ${columns.toString()} where ${this.primaryKey} = '${primaryKey}'`;

        sql = await this.beforeAction(ActionType.UPDATE, sqlHash, sql);

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(ActionType.UPDATE, false, sqlHash));
    }

    // 批量修改，req.body传数组
    public async bulkUpdateRows(rows: Record<string, any>[], userId?: string) {
        if (!rows || !Array.isArray(rows)) {
            throw new Error(`请检查传入参数rows: ${JSON.stringify(rows)}，必须是一个数组`);
        }
        const primaryKeys = rows.map((v) => {
            if (!v[this.camelizePrimaryKey]) {
                throw new Error('缺少必传参数primaryKey');
            }
            return v[this.camelizePrimaryKey];
        });

        const res = await this.bulkViewsRows(primaryKeys);
        if (res.length !== primaryKeys.length) {
            throw new Error(`不存在数据，请检查primaryKeys: ${primaryKeys}`);
        }

        const { sql: column, sqlHash } = this.formatBulkUpdateRow(rows, userId);
        let sql = `update ${this.table} set ${column} where ${this.primaryKey} in (${primaryKeys
            .map((v) => `'${v}'`)
            .toString()})`;

        sql = await this.beforeAction(ActionType.BULKUPDATE, sqlHash, sql);

        return db.beginTransaction<OkPacket>(sql, this.checkTransactionRes(ActionType.BULKUPDATE, true, sqlHash));
    }

    // 详情方法
    public async viewsRows<T extends Record<string, any>>(primaryKey: string): Promise<T> {
        if (!primaryKey) {
            throw new Error('缺少必填参数primaryKey');
        }
        if (!this.viewsFields.length) {
            throw new Error('请实现抽象数组viewsFields，进行查询字段');
        }
        let sql = this.viewBuilder;

        sql = await this.beforeAction(ActionType.VIEW, primaryKey, sql);
        const [res] = await db.asyncQueryBySock<Record<string, any>[]>(
            this.getTableSock(ActionType.VIEW),
            sql,
            primaryKey
        );
        await this.afterAction(ActionType.VIEW, res);
        return this.formatQueryView<T>(res) ?? ({} as T);
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
        await this.afterAction(ActionType.BULKVIEW, res);
        return this.formatQueryList(res);
    }

    public async import(file: Express.Multer.File, userId: string, validator?: Validator) {
        const [{ data }] = nodeXlsx.parse(file.buffer);
        // 去掉表头
        data.shift();
        const importKeys = this.importHeader.map((v) => this.camelizeField(v.key));
        const insertData = (data as (string | number)[][]).map((v) =>
            v.reduce((a, v, i) => {
                a[importKeys[i]] = v;
                return a;
            }, {})
        );
        if (validator) {
            await this.validateParams(insertData, validator);
        }
        await this.insertRows(insertData, userId);
    }

    public async importTemplateDownload() {
        const header: string[] = [];
        const comment: string[] = [];

        this.importTemplateDownloadHeader.forEach((v) => {
            header.push(v.label);
            comment.push(v.comment);
        });

        return nodeXlsx.build([
            {
                name: 'sheet',
                data: [header, comment],
                options: {}
            }
        ]);
    }

    public async export(params: Record<string, any>, ids: string[]) {
        const result = await this.getCountAndRows(params, ids);
        let list: Record<string, any>[];
        if (this.hasPagination) {
            [list] = result as [Record<string, any>[], Pagination];
        } else {
            list = result;
        }
        const header: string[] = [];
        const keys: string[] = [];
        this.exportHeader.forEach((v) => {
            header.push(v.label);
            keys.push(v.key);
        });

        const data = list.map((v) =>
            keys.map((key) => {
                const camelizeKey = this.camelizeField(key);
                if (v[camelizeKey] === undefined) {
                    throw new Error(`列表数据不存在该字段：${key}，请检查该字段`);
                }

                return v[camelizeKey];
            })
        );

        return nodeXlsx.build([
            {
                name: 'sheet',
                data: [header, ...data],
                options: {}
            }
        ]);
    }

    // 查询语句生成，复杂语句请重写此方法
    protected getCountAndRowsBuilder(params: Record<string, any>, ids?: string[]) {
        const reqParams = { ...params };
        const { match, whereIn, findInSet, time, defaultMatch } = this.queryCondition;
        if (reqParams) {
            // tslint:disable:cyclomatic-complexity
            let sql: string[] | string = Object.keys(reqParams).reduce((a, key) => {
                const value = reqParams[key];
                const v = this.deCamelizeField(key);
                let sql;
                if (value !== undefined && value !== null && value !== '') {
                    const isOrWhere = this.orWhere.includes(v);
                    if (match && match.length && match.includes(v)) {
                        sql = `${v} like '%${value}%'`;
                    } else if (whereIn && whereIn.length && whereIn.includes(v)) {
                        sql = this.whereInSql(v, value instanceof Array ? value : [value]);
                    } else if (findInSet && findInSet.length && findInSet.includes(v)) {
                        sql = this.findInSetSql(v, value instanceof Array ? value : [value], isOrWhere);
                    } else if (time && time.length && time.includes(v)) {
                        const [start, end] = value;

                        sql = `${v} between '${start}' and '${end}'`;
                    } else if (defaultMatch && defaultMatch.length && defaultMatch.includes(v)) {
                        sql = `${v} = '${value}'`;
                    }
                }

                if (sql) {
                    a.push(sql);
                }
                return a;
            }, [] as string[]);
            if (ids && ids.length) {
                sql.push(this.whereInSql(this.primaryKey, ids));
            }
            if (sql.length) {
                sql = ` where ${sql.join(' and ')}`;
            }

            return sql;
        }
    }

    // 操作前置钩子，如需使用钩子请重写此方法
    protected async beforeAction(_type: ActionType, _data: any, sql: string): Promise<string> {
        return sql;
    }

    /**
     * 操作后置钩子，如需使用钩子请重写此方法
     * @param _type 操作类型
     * @param _data 参数
     * @param _conn 如果是mysql事务，会传入事务连接
     */
    protected async afterAction(_type: ActionType, _data: any, _conn?: mysql.PoolConnection): Promise<void> {}

    // 生成排序语句，如果需要排序，请重写sortFields
    protected generateSortFields(sort?: string[]) {
        const arr = [...this.sortFields];
        if (sort && sort.length) {
            sort.forEach((v) => {
                let order: 'ASC' | 'DESC' = 'DESC';
                let key = v;
                const pre = v[0];
                if (pre === '-') {
                    order = 'DESC';
                    key = v.slice(1);
                } else {
                    order = 'ASC';
                }
                console.log(this.deCamelizeField(key));
                const index = arr.findIndex((item) => item.column === this.deCamelizeField(key));
                if (index === -1) {
                    throw new Error(`不存在此排序字段，请检查字段${v}`);
                }
                arr[index].order = order;
            });
        }
        return this.sortFields.map((v) => `${v.column} ${v.order}`).toString() || undefined;
    }

    protected paginationSql(limit = 10, page = 1) {
        return `limit ${(+page - 1) * +limit},${limit}`;
    }

    protected whereInSql(field: string, value: (string | number)[]) {
        return `${field} in (${value.map((v) => `'${v}'`).toString()})`;
    }

    protected findInSetSql(field: string, value: (string | number)[], isOrWhere = false) {
        return `(${value.map((v) => `find_in_set('${v}', ${field})`).join(isOrWhere ? ' or ' : ' and ')})`;
    }

    protected getTableSock(action: ActionType) {
        return `${this.table}-${this.primaryKey}:${action}`;
    }

    protected formatBulkUpdateRow(primaryKeys: Record<string, any>[], userId?: string) {
        const obj: Record<string, string[]> = {};
        const sqlHash: Record<string, any>[] = [];
        primaryKeys.reduce((a, v) => {
            const params = this.generateUpdateData(v, userId);
            sqlHash.push(this.deCamelizeObjectField(params)!);
            Object.keys(params).forEach((item) => {
                if (item !== this.camelizePrimaryKey) {
                    if (!a[item]) {
                        a[item] = [];
                    }
                    if (this.updateFields.includes(this.deCamelizeField(item))) {
                        a[item].push(`when '${v[this.camelizePrimaryKey]}' then '${params[item]}'`);
                    } else {
                        throw new Error(`存在未知修改字段，请检查传入参数${item}: ${params[item]}`);
                    }
                }
            });
            return a;
        }, obj);

        return {
            sqlHash,
            sql: Object.keys(obj)
                .reduce((a, v) => {
                    a.push(`${this.deCamelizeField(v)} = case ${this.primaryKey} ${obj[v].join(' ')} end`);
                    return a;
                }, [] as string[])
                .toString()
        };
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
        const reg = /[A-Z]/g;
        if (!this.prefixField) {
            return `${str.replace(reg, (matched) => `_${matched.toLocaleLowerCase()}`)}`;
        }
        if (new RegExp(`^${this.prefixField}_`).test(str)) {
            return str;
        }
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

    protected checkTransactionRes(type: ActionType | null, isBulk: boolean, rows: any, cb?: () => Promise<void>) {
        return async (res: OkPacket, conn: mysql.PoolConnection) => {
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
            cb && (await cb());
            type && (await this.afterAction(type, rows, conn));
        };
    }

    protected formatQueryList<T>(list: T[]) {
        return list.map((v) => this.formatQueryView(v));
    }

    private validateParams(data: Record<string, any>[], validator: Validator) {
        return new Promise((resolve, reject) => {
            data.forEach((v, i) => {
                validator?.(v, undefined, undefined, (err) => {
                    if (err) {
                        reject(err);
                    }

                    if (i === data.length - 1) {
                        resolve(true);
                    }
                });
            });
        });
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

    private formatQueryView<T>(obj: Record<string, any>) {
        if (!obj) {
            return null;
        }

        const result = this.camelizeObjectField(obj);
        if (this.formatDate && result) {
            const { createTime, updateTime } = result;
            createTime && (result.createTime = Util.dateFormat(createTime, 'yyyy-MM-dd HH:mm:ss'));
            updateTime && (result.updateTime = Util.dateFormat(updateTime, 'yyyy-MM-dd HH:mm:ss'));
        }
        return result as T;
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
}
