import BaseDao, { QueryCondition, SortFields } from '@src/models/BaseDao';

export default class extends BaseDao {
    public hasPagination = true;
    public table = 'opera_list';
    public primaryKey = 'opera_id';

    protected viewsFields: string[] = [];
    protected sortFields: SortFields[] = [];

    // 特殊查询字段
    protected queryCondition: QueryCondition = {
        // 模糊查询
        match: ['name'],
        // 时间，值传[start, end]数组
        time: [],
        // find_in_set，值传数组
        findInSet: ['types'],
        // in语法，值传数组
        whereIn: [],
        defaultMatch: ['man', 'woman', 'is_city_limit']
    };

    protected listFields = [
        'opera_id',
        'id',
        '`name`',
        'man',
        'woman',
        'pic_url',
        'game_time',
        'difficulty',
        'is_city_limit',
        'is_exclusive',
        'types'
    ];

    private operaListViewColumns = [
        'opera_id',
        'id',
        '`name`',
        'man',
        'woman',
        'pic_url',
        'game_time',
        'difficulty',
        'recommend',
        'default_catalogs_names',
        'is_city_limit',
        'is_exclusive'
    ];

    public getOperaListViewSql() {
        return `select ${this.operaListViewColumns.join()} from opera_list where id = ?`;
    }
}
