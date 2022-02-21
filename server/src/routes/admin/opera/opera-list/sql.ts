import SqlBase from '@src/models/Sql';

export default class extends SqlBase {
    private operaListColumns = [
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

    public constructor() {
        super();
    }

    public getOperaListSql(req: ExpressRequest) {
        const { name, man, woman, types, is_city_limit } = req.query;
        let sql = 'select SQL_CALC_FOUND_ROWS ' + this.operaListColumns.join() + ' from opera_list ';
        const whereClause: string[] = [];

        if (name) {
            whereClause.push(`\`name\` like '%${name}%'`);
        }

        if (man) {
            whereClause.push('man=' + man);
        }

        if (woman) {
            whereClause.push('woman=' + woman);
        }

        if (types) {
            whereClause.push(this.findInSetSql('types', types as string[]));
        }

        if (is_city_limit) {
            whereClause.push('is_city_limit=' + is_city_limit);
        }

        if (whereClause.length) {
            sql += 'where ' + whereClause.join(' and ') + ' ';
        }

        sql += this.paginationSql(req);
        sql += ';SELECT FOUND_ROWS();';

        return sql;
    }

    public getOperaListViewSql() {
        return 'select ' + this.operaListViewColumns.join() + ' from opera_list where id = ?';
    }
}
