import BaseHandler from '@src/models/BaseHandler';
import Dao from './Dao';

const dao = new Dao();
export default class extends BaseHandler<Dao> {
    protected get dao() {
        return dao;
    }

    // public async listAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
    //     const result = await this.dao.getCountAndRows(req.query);
    //     let list = result[0];
    //     const totalObj = result[1];
    //     if (this.dao.needToArrayFields?.length) {
    //         list = Util.arrayOrObjectKeyToArray(list, this.dao.camelizeNeedToArrayFields);
    //     }
    //     // list.forEach((v: Record<string, any>) => {
    //     //     if (v.type && v.type.length) {
    //     //         v.typeValue = v.typeValue.split(',').sort().toString();
    //     //     }
    //     // });
    //     res.success(list, totalObj as Pagination);
    // }
}
