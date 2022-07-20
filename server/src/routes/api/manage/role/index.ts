import Api from '@src/routes/api';
import Handler from './Handler';
import { Controller, Post, SuperRoutes, SuperRoutesValidator } from '@src/descriptor/controller';
import validation from './validation';
import { NextFunction } from 'express';
import Validate from '@src/descriptor/validate';
import Joi from 'joi';
import Util from '@util';
import Middleware from '@src/descriptor/middleware';

const handler = new Handler();
@SuperRoutesValidator(validation)
@SuperRoutes('single')
// @TurnOffParamsValidate
@Controller('/manage/role')
export default class Role extends Api<Handler> {
    protected get handler() {
        return handler;
    }

    @Middleware()
    @Validate({
        userId: Joi.array()
            .items(Joi.string())
            .required()
            .error((err) =>
                Util.joiErrorMessage(err, {
                    required: '请传入必填项userId',
                    base: 'userId必须是数组'
                })
            ),
        roleId: Joi.string().required().error(new Error('请传入必填项roleId'))
    })
    @Post('/add-user')
    public async addUser(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.addUserAction(req, res, next);
    }
}
