import Api from '@src/routes/api';
import Handler from './Handler';
import { Controller, Get, Post, RoutesType, SuperRoutes } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import { NextFunction } from 'express';
import Validate from '@src/descriptor/validate';
import Joi from 'joi';
import Util from '@util';

const handler = new Handler();
// @SuperRoutesValidator(validation)
@SuperRoutes([RoutesType.LIST])
// @TurnOffParamsValidate
@Controller('/manage/permission')
export default class Permission extends Api<Handler> {
    protected get handler() {
        return handler;
    }

    @Middleware()
    @Validate({
        roleId: Joi.string().required().error(new Error('roleId为必填项'))
    })
    @Get('/role-permission')
    public async rolePermission(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.rolePermissionAction(req, res, next);
    }

    @Middleware()
    @Validate({
        permissionId: Joi.array()
            .items(Joi.string())
            .error((err) =>
                Util.joiErrorMessage(err, {
                    base: 'permissionId必须是数组'
                })
            ),
        roleId: Joi.string().required().error(new Error('roleId为必填项'))
    })
    @Post('/change-role-permission')
    public async changeRolePermission(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.changeRolePermissionAction(req, res, next);
    }
}
