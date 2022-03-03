import BaseDao, { ActionType, QueryCondition, SortFields } from '@src/models/BaseDao';
import Override from '@src/descriptor/Override';

export default class extends BaseDao {
    public table = 'test';
    public primaryKey = 'id';
    protected viewsFields = ['id', 'name', 'age'];

    protected sortFields: SortFields[] = [];

    // 特殊查询字段
    protected queryCondition: QueryCondition = {
        // 模糊查询
        match: ['name'],
        // 时间，值传[start, end]数组
        time: [],
        // find_in_set，值传数组
        findInSet: [],
        // in语法，值传数组
        whereIn: [],
        defaultMatch: ['id', 'age']
    };

    protected listFields = ['id', 'name', 'age'];

    protected insertFields = ['name', 'age'];

    @Override
    protected async beforeAction(type: ActionType, data: any, sql: string): Promise<string> {
        console.log(type, data, sql);
        return sql;
    }
}
