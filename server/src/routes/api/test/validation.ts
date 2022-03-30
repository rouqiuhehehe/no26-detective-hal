import { RoutesType, Validation } from '@src/descriptor/controller';
import Joi from 'joi';
import Util from '@util';

export default {
    [RoutesType.LIST]: [
        {
            name: Joi.string()
                .min(4)
                .max(8)
                .regex(Util.specialSymbolsRegExp(), {
                    invert: true
                })
                .required()
                .error((err) =>
                    Util.joiErrorMessage(err, {
                        min: '昵称不能少于4个字符',
                        max: '昵称不能大于8个字符',
                        required: '请输入昵称',
                        regx: '昵称不能带有特殊符号'
                    })
                )
        }
    ]
} as Validation;
