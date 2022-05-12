import BaseHandler from '@src/models/BaseHandler';
import Dao, { UserListType } from './Dao';
import Util from '@util';
import { Pagination } from '@src/models/BaseDao';
import Override from '@src/descriptor/Override';

const dao = new Dao();
export default class extends BaseHandler<Dao> {
    protected get dao() {
        return dao;
    }

    @Override
    public async listAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const [list, totalObj] = await this.dao.getCountAndRows(req.query);
        (list as UserListType[]).forEach((v) => {
            if (v.avatar) {
                v.avatar = Util.getUrlWithHost(v.avatar);
            }
        });
        res.success(list, totalObj as Pagination);
    }

    @Override
    public async viewsAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const result = await this.dao.viewsRows<UserListType>(req.query[this.dao.camelizePrimaryKey] as string);
        Object.keys(result).forEach((v) => {
            v === 'avatar' && result[v] && (result[v] = Util.getUrlWithHost(result[v]!));
        });
        res.success(result);
    }

    public async getNotAddUserListAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const { id, ...otherParams } = req.query;

        const [list, totalObj] = await this.dao.getNotAddUser(otherParams, id as string);
        (list as UserListType[]).filter((v) => {
            if (v.avatar) {
                v.avatar = Util.getUrlWithHost(v.avatar);
            }
            return true;
        });
        res.success(list, totalObj as Pagination);
    }
}
