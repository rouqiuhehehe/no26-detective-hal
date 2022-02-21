import Db from '@src/bin/Db';
import { Controller, Get } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Validate from '@src/descriptor/validate';
import Joi from 'joi';
import admin from '..';

const db = new Db();
@Controller('/workbench')
export default class extends admin {
    @Middleware()
    @Validate({
        types: Joi.array().items(Joi.string()).required()
    })
    @Get('/get-opera-types-count')
    public async getOperaTypesCount(req: ExpressRequest, res: ExpressResponse) {
        const { types } = req.query;

        const ids = await this.getOperaTypesIdByTypes(types as string[]);

        const countArr = await this.getOperaListCountByIds(ids.map((v) => v.id));

        const resData = countArr.map<{
            count: number;
            label: string;
            opera_name: string[];
        }>((v) => {
            const label = ids.find(({ id }) => id === v.type)?.label ?? 's';

            return {
                count: v.count,
                label,
                opera_name: v.name
            };
        });
        res.success(resData);
    }

    private async getOperaTypesIdByTypes(types: string[]) {
        const sqlTypes = (types as string[]).map((v) => `'${v}'`).toString();
        const sql = `select id, label from opera_types where label in (${sqlTypes})`;
        return await db.asyncQueryBySock<{ id: number; label: string }[]>('/workbench/get-opera-types-count', sql);
    }

    private async getOperaListCountByIds(ids: number[]) {
        const res: {
            count: number;
            type: number;
            name: string[];
        }[] = [];
        for (const v of ids) {
            const sql = `select name from opera_list where types regexp '(?<![0-9])${v}(?![0-9])';`;

            const name = await db.asyncQuery<{ name: string }[]>(sql);

            res.push({
                count: name.length,
                type: v,
                name: name.map((v) => v.name)
            });
        }

        return res;
    }
}
