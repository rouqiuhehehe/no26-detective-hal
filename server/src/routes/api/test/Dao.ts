import BaseDao, { ActionType, QueryCondition, SortFields } from "@src/models/BaseDao";
import Override from "@src/descriptor/Override";
import Util from "@util";
import mysql from "mysql";

export default class extends BaseDao {
    public table = "test";
    public primaryKey = "n_id";
    public needToArrayFields = ["n_type"];
    protected prefixField = "n";
    protected formatDate = true;
    protected importHeader = [
        {
            label: "姓名",
            key: "n_name"
        },
        {
            label: "年龄",
            key: "n_age"
        }
    ];
    protected importTemplateDownloadHeader = [
        {
            comment: "姓名，请输入4-8位不带有特殊字符的字符串",
            label: "姓名",
            key: "n_name"
        },
        {
            comment: "年龄，请输入0-200之间的数字",
            label: "年龄",
            key: "n_age"
        }
    ];
    protected importTemplateDownloadName = "test列表导入模板";
    protected exportHeader = [
        {
            key: "n_name",
            label: "姓名"
        },
        {
            key: "n_age",
            label: "年龄"
        },
        {
            key: "n_create_time",
            label: "创建时间"
        },
        {
            key: "n_update_time",
            label: "修改时间"
        }
    ];
    protected exportName = "test列表";

    protected viewsFields = [
        "n_id",
        "n_name",
        "n_type",
        "n_age",
        "n_create_time",
        "n_update_time",
        "n_create_user",
        "n_update_user"
    ];

    protected sortFields: SortFields[] = [
        {
            column: "n_create_time",
            order: "DESC"
        }
    ];

    // 特殊查询字段
    protected queryCondition: QueryCondition = {
        // 模糊查询
        match: ["n_name"],
        // 时间，值传[start, end]数组
        time: ["n_create_time", "n_update_time"],
        // find_in_set，值传数组
        findInSet: ["n_type"],
        // in语法，值传数组
        whereIn: [],
        defaultMatch: ["n_age"]
    };

    protected orWhere = ["n_type"];

    protected listFields = [
        "n_id",
        "n_name",
        "n_age",
        "n_type",
        "n_create_time",
        "n_update_time",
        "n_create_user",
        "n_update_user"
    ];

    protected insertFields = {
        must: ["n_name", "n_id", "n_create_time", "n_update_time", "n_create_user", "n_update_user"],
        optional: ["n_age", "n_type"]
    };

    protected updateFields = ["n_name", "n_type", "n_age", "n_update_time", "n_update_user"];

    // type关联表字段
    private relationFields = [
        "n_relation_id",
        "n_id",
        "n_create_time",
        "n_update_time",
        "n_create_user",
        "n_update_user"
    ];

    @Override
    protected async beforeAction (type: ActionType, data: any, sql: string): Promise<string> {
        switch (type) {
            case ActionType.INSERT:
                await this.beforeInsert(data);
                break;
        }
        return sql;
    }

    @Override
    protected async afterAction (type: ActionType, data: any, conn?: mysql.PoolConnection) {
        switch (type) {
            case ActionType.INSERT:
                await this.addAssociationTable(data[0], conn!);
                break;
            case ActionType.UPDATE:
                await this.updateAssociationTable(data, conn!);
                break;
            case ActionType.DELETE:
                await this.deleteAssociationTable(data, conn!);
                break;
            case ActionType.BULKUPDATE:
                await this.bulkUpdateAssociationTable(data, conn!);
        }
        // 添加关联表
    }

    @Override
    protected get hasPaginationBuilder () {
        return `SELECT
                    SQL_CALC_FOUND_ROWS
                    t1.n_id,
                    t1.n_name,
                    t1.n_age,
                    t1.n_type,
                    t1.n_create_time,
                    t1.n_update_time,
                    t1.n_create_user,
                    t1.n_update_user,
                    A.n_type_value
                FROM
                  test t1
                LEFT JOIN
                    (
                    SELECT n_id, GROUP_CONCAT(c.label ORDER BY b.id) as n_type_value from opera_types_relation b
                    LEFT JOIN opera_types c on b.n_relation_id = c.id GROUP BY n_id
                    ) as A on t1.n_id = A.n_id`;
    }

    private async beforeInsert (data: Record<string, any> | Record<string, any>[]) {
        const hash = data instanceof Array ? data : [data];

        // 校验重复字段
        const repeatFields = ["n_name", "n_age"];

        const repeatObj = hash.reduce(
            (a, v) => {
                const item = this.deCamelizeObjectField(v)!;
                Object.keys(item).forEach((v) => {
                    if (repeatFields.includes(v)) {
                        a[v].push(`'${ item[v] }'`);
                    }
                });
                return a;
            },
            {
                n_name: [],
                n_age: []
            }
        ) as {
            n_name: [];
            n_age: [];
        };

        const sqlName = this.getCheckRepeatSql("n_name", repeatObj.n_name);
        const sqlAge = this.getCheckRepeatSql("n_age", repeatObj.n_age);

        const [repeatName, repeatAge] = await Promise.all([
            this.db.asyncQuery<{ n_name: string; "count(n_name)": number }[]>(sqlName),
            this.db.asyncQuery<{ n_age: string; "count(n_age)": number }[]>(sqlAge)
        ]);
        this.checkRepeatNameOrAge(repeatName, repeatAge);
    }

    private checkRepeatNameOrAge (
        repeatName: { n_name: string; "count(n_name)": number }[],
        repeatAge: { n_age: string; "count(n_age)": number }[]
    ) {
        if (repeatName.length && repeatAge.length) {
            throw new Error(
                `name和age不可重复，请检查 name：${ repeatName.map((v) => v.n_name).toString() }， age：${ repeatAge
                    .map((v) => v.n_age)
                    .toString() }`
            );
        } else if (repeatName.length) {
            throw new Error(`name不可重复，请检查 name：${ repeatName.map((v) => v.n_name).toString() }`);
        } else if (repeatAge.length) {
            throw new Error(`age不可重复，请检查 age：${ repeatAge.map((v) => v.n_age).toString() }`);
        }
    }

    private getCheckRepeatSql (field: string, values: string[]) {
        return `select ${field}, count(${field}) from ${this.table} group by ${field} having ${field} in (${values.join(
            ","
        )})`;
    }

    // 添加关联表
    private async addAssociationTable (data: Record<string, any>, conn: mysql.PoolConnection) {
        const { n_type: type } = data;
        if (type && type.length) {
            const params = Util.arrayInObjectToString(data);
            const arr = type.map((item: number) => {
                const arr = new Array(this.relationFields.length).fill("default");
                params.n_relation_id = item;
                this.relationFields.forEach((v, i) => {
                    if (params[v]) {
                        arr[i] = `'${ params[v] }'`;
                    }
                });
                return `(${ arr.toString() })`;
            });

            const sql = `INSERT INTO opera_types_relation (${this.relationFields.toString()}) VALUES ${arr.toString()}`;
            await this.db.transactionHandle(conn, sql);
        }
    }

    // 删除关联表
    private async deleteAssociationTable (id: string, conn: mysql.PoolConnection) {
        const sql = `DELETE FROM opera_types_relation WHERE n_id = '${id}'`;
        await this.db.transactionHandle(conn, sql);
    }

    // 修改关联表
    private async updateAssociationTable (data: Record<string, any>, conn: mysql.PoolConnection) {
        const { id } = data;
        await this.deleteAssociationTable(id, conn);
        data.n_create_time = data.n_update_time;
        data.n_create_user = data.n_update_user;
        data.n_id = data.id;
        await this.addAssociationTable(data, conn);
    }

    private bulkUpdateAssociationTable (data: Record<string, any>[], conn: mysql.PoolConnection) {
        data.forEach(async (v) => {
            await this.deleteAssociationTable(v.n_id, conn);
            v.n_create_time = v.n_update_time;
            v.n_create_user = v.n_update_user;
            await this.addAssociationTable(v, conn);
        });
    }
}
