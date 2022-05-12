import { RoutesType, Validation } from '@src/descriptor/controller';
import Joi from 'joi';
import regExp from '@src/util/regExp';
import Util from '@util';

const insertValidator = {
    name: Joi.string()
        .required()
        .min(1)
        .max(20)
        .regex(regExp.chineseAndNumberAndLetter(1, 20), {
            invert: false
        })
        .error((err) =>
            Util.joiErrorMessage(err, {
                base: '角色名称必须是字符串',
                min: '角色名称不能少于1个字符',
                max: '角色名称不能大于20个字符',
                required: '角色名称不能为空',
                regx: '请输入1～20位以内的字符，支持汉字、数字、英文字母'
            })
        ),
    info: Joi.string().required().error(new Error('角色描述不能为空'))
};
export default {
    [RoutesType.INSERT]: [insertValidator],
    [RoutesType.UPDATE]: [
        {
            ...insertValidator,
            id: Joi.string().required().error(new Error('请传入角色id'))
        }
    ]
} as Validation;
