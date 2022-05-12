import { RoutesType, Validation } from '@src/descriptor/controller';
import Joi from 'joi';
import Util from '@util';
import regExp from '@src/util/regExp';

export default {
    [RoutesType.INSERT]: [
        {
            name: Joi.string()
                .min(2)
                .max(8)
                .regex(regExp.specialSymbolsRegExp(), {
                    invert: true
                })
                .required()
                .error((err) =>
                    Util.joiErrorMessage(err, {
                        base: '姓名必须是字符串',
                        min: '姓名不能少于2个字符',
                        max: '姓名不能大于8个字符',
                        required: '请输入姓名',
                        regx: '姓名不能带有特殊符号'
                    })
                ),
            age: Joi.number()
                .min(0)
                // tslint:disable-next-line:no-magic-numbers
                .max(200)
                .required()
                .error((err) =>
                    Util.joiErrorMessage(err, {
                        base: '年龄必须是数字',
                        min: '年龄不能小于0',
                        max: '年龄不能大于200',
                        required: '请输入年龄'
                    })
                )
        }
    ],
    [RoutesType.DELETE]: [
        {
            id: Joi.string()
                .required()
                .error((err) =>
                    Util.joiErrorMessage(err, {
                        required: '缺少参数：id',
                        base: 'id必须是字符串'
                    })
                )
        }
    ]
} as Validation;
