import Api from '@src/routes/api';
import Handler from './Handler';
import { Controller, Get, SuperRoutes, SuperRoutesValidator } from '@src/descriptor/controller';
import Required from '@src/descriptor/required';
import { NextFunction } from 'express';
import Middleware from '@src/descriptor/middleware';
import validation from './validation';

const handler = new Handler();
@SuperRoutesValidator(validation)
@SuperRoutes('single')
// @TurnOffParamsValidate
@Controller('/manage/user')
export default class User extends Api<Handler> {
    protected get handler() {
        return handler;
    }

    @Middleware()
    @Required(['!id'])
    @Get('/not-add')
    public async getNotAddUserList(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.getNotAddUserListAction(req, res, next);
    }
}
