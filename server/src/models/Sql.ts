export default class SqlBase {
    protected paginationSql(req: ExpressRequest) {
        const { limit = 10, page = 1 } = req.query;
        return `limit ${(+page - 1) * +limit},${limit}`;
    }

    protected findInSetSql(fieId: string, value: (string | number)[]) {
        return value.map((v) => `find_in_set(${v}, ${fieId})`).join(' and ');
    }
}
