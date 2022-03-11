import BaseDao, { Pagination } from '@src/models/BaseDao';
import HttpError from '@src/models/httpError';
import { Status } from '@src/config/server_config';
import ProxyTarget from '@src/descriptor/ProxyTarget';
import Autobind from '@src/descriptor/Autobind';

const sendHttpError = (e: unknown, next: NextFunction) => {
    if (e instanceof Error) {
        next(new HttpError(Status.SERVER_ERROR, e.message, e));
    } else {
        next(new HttpError(Status.SERVER_ERROR, String(e)));
    }
};
const proxy: ProxyHandler<BaseHandler<BaseDao>> = {
    get(target, key) {
        const fn = target[key];

        return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
            try {
                await fn(req, res, next);
            } catch (e) {
                sendHttpError(e, next);
            }
        };
    }
};

@ProxyTarget(proxy)
@Autobind
export default abstract class BaseHandler<T extends BaseDao> {
    protected abstract get dao(): T;

    public async listAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const result = await this.dao.getCountAndRows(req.query);
        if (this.dao.hasPagination) {
            const [list, totalObj] = result;

            res.success(list, totalObj as Pagination);
        } else {
            res.success(result);
        }
    }

    public async insertAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.insertRows(req.body);

        res.success();
    }

    public async viewsAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const [result] = await this.dao.viewsRows(req.query[this.dao.camelizePrimaryKey] as string);
        res.success(result ?? {});
    }

    public async bulkViewsAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const result = await this.dao.bulkViewsRows(req.query[this.dao.camelizePrimaryKey] as string[]);
        res.success(result ?? []);
    }

    public async deleteAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.deleteRows(req.body[this.dao.camelizePrimaryKey] as string);

        res.success();
    }

    public async bulkDeleteAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.bulkDeleteRows(req.body[this.dao.camelizePrimaryKey] as string[]);

        res.success();
    }

    public async updateAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.updateRows(req.body);

        res.success();
    }

    public async bulkUpdateAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.bulkUpdateRows(req.body);

        res.success();
    }
}
