import { RoutesType, Validation } from '@src/descriptor/controller';
import Joi from 'joi';

const deleteValidator = {
    roleId: Joi.string().required().error(new Error('请传入必填项roleId')),
    uid: Joi.string().required().error(new Error('请传入必填项uid'))
};
export default {
    [RoutesType.DELETE]: [deleteValidator]
} as Validation;
