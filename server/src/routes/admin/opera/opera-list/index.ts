import admin from '@src/routes/admin';
import { Controller, Get } from '@src/descriptor/controller';
import Db from '@src/bin/db';
import Middleware from '@src/descriptor/middleware';
import Required from '@src/descriptor/required';
import Validate from '@src/descriptor/validate';
import Joi from 'joi';
import Sql from '@src/routes/admin/opera/opera-list/sql';
import HttpError from '@src/models/httpError';
import { Status } from '@src/config/server_config';
import {spawnSync} from 'child_process'

interface OperaListType {
    opera_id: number;
    id: string;
    name: string;
    man: number;
    woman: number;
    pic_url: string;
    game_time: string;
    difficulty: number;
    recommend: string;
    default_catalogs_names: string;
    is_city_limit: number;
    is_exclusive: number;
}

const db = new Db();
const SQL = new Sql();
@Controller('/opera')
export default class extends admin {
    /*
     * route
     * */
    @Validate(
        {
            name: Joi.string(),
            man: Joi.number(),
            woman: Joi.number(),
            types: Joi.array().items(Joi.number()),
            is_city_limit: Joi.number()
        },
        true
    )
    @Middleware()
    @Get('/opera-list')
    public async getOperaList(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.getOperaListHandle(req, res, next);
    }

    @Required(['!id'])
    @Middleware()
    @Get('/opera-list/view')
    public async getOperaListView(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.getOperaListViewHandle(req, res, next);
    }

    /*
     *  handle
     * */
    private async getOperaListHandle(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const sql = SQL.getOperaListSql(req);
        const { page = 1 } = req.query;

        try {
            const [list, total] = await db.asyncQueryBySock<
                [Omit<OperaListType, 'default_catalogs_names' | 'recommend'>[], Pagination]
            >(req, sql);
            res.success(list, {
                total: total[0]['FOUND_ROWS()'],
                page: +page
            });
        } catch (e: any) {
            next(new HttpError(Status.SERVER_ERROR, e.message, e));
        }
    }

    private async getOperaListViewHandle(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const { id } = req.query;
        const sql = SQL.getOperaListViewSql();

        try {
            const list = (await db.asyncQueryBySock<OperaListType>(req, sql, id as string))[0];

            res.success(list);
        } catch (e: any) {
            next(new HttpError(Status.SERVER_ERROR, e.message, e));
        }
    }
}
