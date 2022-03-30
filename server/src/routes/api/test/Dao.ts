import BaseDao, { ActionType, QueryCondition, SortFields } from '@src/models/BaseDao';
import Override from '@src/descriptor/Override';
import Util from '@util';

export default class extends BaseDao {
    public table = 'test';
    public primaryKey = 'n_id';
    protected prefixField = 'n';
    protected formatDate = true;
    protected viewsFields = [
        'n_id',
        'n_name',
        'n_age',
        'n_create_time',
        'n_update_time',
        'n_create_user',
        'n_update_user'
    ];

    protected sortFields: SortFields[] = [
        {
            column: 'n_update_time',
            order: 'DESC'
        }
    ];

    // 特殊查询字段
    protected queryCondition: QueryCondition = {
        // 模糊查询
        match: ['n_name'],
        // 时间，值传[start, end]数组
        time: ['n_create_time', 'n_update_time'],
        // find_in_set，值传数组
        findInSet: [],
        // in语法，值传数组
        whereIn: [],
        defaultMatch: ['n_age']
    };

    protected listFields = [
        'n_id',
        'n_name',
        'n_age',
        'n_create_time',
        'n_update_time',
        'n_create_user',
        'n_update_user'
    ];

    protected insertFields = {
        must: ['n_name', 'n_id', 'n_create_time', 'n_update_time', 'n_create_user', 'n_update_user'],
        optional: ['n_age']
    };

    protected updateFields = ['n_name', 'n_age', 'n_update_time', 'n_update_user'];

    @Override
    protected async beforeAction(type: ActionType, data: any, sql: string): Promise<string> {
        switch (type) {
            case ActionType.INSERT:
                await this.beforeInsert(data);
                break;
        }
        return sql;
    }

    private async beforeInsert(data: Record<string, any> | Record<string, any>[]) {
        const hash = data instanceof Array ? data : [data];

        // 校验重复字段
        const repeatFields = ['n_name', 'n_age'];

        const repeatObj = hash.reduce(
            (a, v) => {
                const item = this.deCamelizeObjectField(v)!;
                Object.keys(item).forEach((v) => {
                    if (repeatFields.includes(v)) {
                        a[v].push(`'${item[v]}'`);
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

        const sql_name = `select n_name from ${this.table} where n_name in (${repeatObj.n_name.toString()})`;
        const sql_age = `select n_age from ${this.table} where n_age in (${repeatObj.n_age.toString()})`;

        const [repeatName, repeatAge] = await Promise.all([
            this.db.asyncQuery<{ n_name: string }[]>(sql_name),
            this.db.asyncQuery<{ n_age: string }[]>(sql_age)
        ]);

        this.checkRepeatNameOrAge(repeatName, repeatAge, repeatObj);
    }

    private checkRepeatNameOrAge(
        repeatName: { n_name: string }[],
        repeatAge: { n_age: string }[],
        repeatObj: { n_name: []; n_age: [] }
    ) {
        if (repeatName.length && repeatAge.length) {
            const repeatNameObj = this.checkName(repeatObj.n_name, repeatName);
            const repeatAgeObj = this.checkAge(repeatObj.n_age, repeatAge);

            throw new Error(
                `name和age不可重复，请检查 name：${repeatNameObj.toString()}， age：${repeatAgeObj.toString()}`
            );
        } else if (repeatName.length) {
            const repeatNameObj = this.checkName(repeatObj.n_name, repeatName);

            throw new Error(`name不可重复，请检查 name：${repeatNameObj.toString()}`);
        } else if (repeatAge.length) {
            const repeatAgeObj = this.checkAge(repeatObj.n_age, repeatAge);

            throw new Error(`age不可重复，请检查 age：${repeatAgeObj.toString()}`);
        }
    }

    private checkName(queryHash: string[], retrieveHash: { n_name: string }[]) {
        return queryHash.filter((v: string) => {
            return retrieveHash.some((item) => item.n_name === Util.removeStartAndEndQuotes(v));
        });
    }

    private checkAge(queryHash: string[], retrieveHash: { n_age: string }[]) {
        return queryHash.filter((v: string) => {
            return retrieveHash.some((item) => item.n_age.toString() === Util.removeStartAndEndQuotes(v));
        });
    }
}
