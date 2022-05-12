import BaseDao, { Pagination } from '@src/models/BaseDao';
import HttpError from '@src/models/httpError';
import { Status } from '@src/config/server_config';
import ProxyTarget from '@src/descriptor/ProxyTarget';
import Upload from '@src/models/upload';
import Util from '@util';

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
            const { _r, timestamp, sign } = req.query;
            Reflect.deleteProperty(req.query, '_r');
            Reflect.deleteProperty(req.query, 'timestamp');
            Reflect.deleteProperty(req.query, 'sign');
            try {
                await fn.call(target, req, res, next);
            } catch (e) {
                req.query._r = _r;
                req.query.timestamp = timestamp;
                req.query.sign = sign;
                sendHttpError(e, next);
            }
        };
    }
};
@ProxyTarget(proxy)
export default abstract class BaseHandler<T extends BaseDao> {
    protected abstract get dao(): T;

    public async listAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const result = await this.dao.getCountAndRows(req.query);
        let list;
        if (this.dao.hasPagination) {
            list = result[0];
            const totalObj = result[1];
            if (this.dao.needToArrayFields?.length) {
                list = Util.arrayOrObjectKeyToArray(list, this.dao.camelizeNeedToArrayFields);
            }
            res.success(list, totalObj as Pagination);
        } else {
            list = result;
            if (this.dao.needToArrayFields?.length) {
                list = Util.arrayOrObjectKeyToArray(result, this.dao.camelizeNeedToArrayFields);
            }
            res.success(list);
        }
    }

    public async insertAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.insertRows(req.body, req.user?.uid);

        res.success();
    }

    public async viewsAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        let result = await this.dao.viewsRows(req.query[this.dao.camelizePrimaryKey] as string);
        if (this.dao.needToArrayFields?.length) {
            result = Util.arrayOrObjectKeyToArray(result, this.dao.camelizeNeedToArrayFields);
        }
        res.success(result);
    }

    public async bulkViewsAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        let result = await this.dao.bulkViewsRows(req.query[this.dao.camelizePrimaryKey] as string[]);
        if (this.dao.needToArrayFields?.length) {
            result = Util.arrayOrObjectKeyToArray(result, this.dao.camelizeNeedToArrayFields);
        }
        res.success(result ?? []);
    }

    public async deleteAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.deleteRows(req.body[this.dao.camelizePrimaryKey] as string, req.body);

        res.success();
    }

    public async bulkDeleteAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.bulkDeleteRows(req.body[this.dao.camelizePrimaryKey] as string[]);

        res.success();
    }

    public async updateAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.updateRows(req.body, req.user?.uid);

        res.success();
    }

    public async bulkUpdateAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        await this.dao.bulkUpdateRows(req.body, req.user?.uid);

        res.success();
    }

    public async importTemplateDownload(_req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const buffer = await this.dao.importTemplateDownload();
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment;filename=${encodeURIComponent(this.dao.getImportTemplateDownloadName)}`
        );
        res.send(buffer);
    }

    public async import(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const { validator, user } = req;
        const upload = new Upload(null, {
            fileId: 'file',
            rule: ['xls', 'xlsx']
        });

        upload.single('file')(req, res, async (err) => {
            if (err) {
                if (Util.isExtendsHttpError(err)) {
                    next(err);
                } else {
                    next(new HttpError(Status.MISSING_PARAMS, err.message, err));
                }
                return;
            }

            try {
                if (user.uid) {
                    await this.dao.import(req.file!, user.uid, validator);
                    res.success();
                } else {
                    next(new HttpError(Status.SERVER_ERROR, '未登录'));
                }
            } catch (e) {
                if (e instanceof Error) {
                    next(new HttpError(Status.SERVER_ERROR, e.message, e));
                }
            }
        });
        // const buffer = await this.dao.import();
        // res.setHeader(
        //     'Content-Type',
        //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        // );
        // res.setHeader('Content-Disposition', `attachment;filename=${encodeURIComponent(this.dao.getImportTemplateDownloadName)}`);
        // res.send(buffer);
    }

    public async export(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const { ids, ...other } = req.body;
        const buffer = await this.dao.export(other, ids);
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        );
        res.setHeader('Content-Disposition', `attachment;filename=${encodeURIComponent(this.dao.getExportName)}`);
        res.send(buffer);
    }
}
