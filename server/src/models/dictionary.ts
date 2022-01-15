import Db from '@src/bin/Db';
import { OperaList, OperaTypes } from '@src/types/dictionary';

const db = new Db();
export default class {
    public async getOperaTypes(req?: ExpressRequest) {
        const sql = 'select id,label from opera_types';

        return req ? await db.asyncQueryBySock<OperaTypes[]>(req, sql) : await db.asyncQuery<OperaTypes[]>(sql);
    }

    public async getAllOperaList(req?: ExpressRequest) {
        const sql = 'select * from opera_list';

        return req ? await db.asyncQueryBySock<OperaList[]>(req, sql) : await db.asyncQuery<OperaList[]>(sql);
    }
}
