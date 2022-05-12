import BaseHandler from '@src/models/BaseHandler';
import Dao from './Dao';
import Override from '@src/descriptor/Override';
import Dictionary from '@src/models/dictionary';
import { Pagination } from '@src/models/BaseDao';

interface ListFields {
    typeValue?: string;
    difficulty: number;
    gameTime: string;
    id: string;
    isCityLimit: number;
    isExclusive: number;
    man: number;
    name: string;
    operaId: number;
    picUrl: string;
    types: string;
    woman: number;
}
const dictionary = new Dictionary();
const dao = new Dao();
export default class extends BaseHandler<Dao> {
    protected get dao() {
        return dao;
    }

    @Override
    public async listAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction): Promise<void> {
        const [list, total] = await this.dao.getCountAndRows<ListFields>(req.query);
        const allTypes = await dictionary.getOperaTypes(req);
        (list as ListFields[]).forEach((v) => {
            const { types } = v;
            const typesHash = types.split(',');
            v.typeValue = typesHash.map((item: string) => allTypes.find((v) => v.id === item)?.label).toString();
        });
        res.success(list, total as Pagination);
    }
}
