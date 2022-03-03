import admin from '@src/routes/admin';
import { Controller, Get } from '@src/descriptor/controller';
import Db from '@src/bin/db';
import Middleware from '@src/descriptor/middleware';
import Required from '@src/descriptor/required';
import Validate from '@src/descriptor/validate';
import Joi from 'joi';
import Sql from '@src/routes/admin/opera/opera-list/Dao';
import HttpError from '@src/models/httpError';
import { Status } from '@src/config/server_config';
import Handler from '@src/routes/admin/opera/opera-list/Handler';

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
const handler = new Handler();
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
        await handler.listAction(req, res, next);
    }

    @Required(['!id'])
    @Middleware()
    @Get('/opera-list/view')
    public async getOperaListView(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.getOperaListViewHandle(req, res, next);
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
