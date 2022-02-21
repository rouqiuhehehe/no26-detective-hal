import { Controller, Get } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Dictionary from '@src/models/dictionary';
import admin from '..';

const dictionary = new Dictionary();
@Controller('/dictionary')
export default class extends admin {
    @Middleware()
    @Get('/get-opera-types')
    public async getOperaTypes(req: ExpressRequest, res: ExpressResponse) {
        const types = await dictionary.getOperaTypes(req);

        res.success(types);
    }
}
