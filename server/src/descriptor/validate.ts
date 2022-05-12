import Joi from 'joi';
import { methodMiddleware } from './middlewareHandle';
import { RouteMethod } from '@src/descriptor/controller';

/**
 * @param params joi对象
 * @param isLimitPage 是否为分页接口
 * @param acceptUnknownParameters 是否接收未知参数
 */
export const joiValidationCallback =
    <T = any, isStrict = false>(
        params: Joi.SchemaMap<T, isStrict>,
        isLimitPage = false,
        acceptUnknownParameters = true
    ) =>
    (method: RouteMethod) =>
    async (
        req: ExpressRequest | Record<string, any>,
        res?: ExpressResponse,
        next?: NextFunction,
        // 验证后置校验，用于支持函数中手动触发校验器
        // = undefined用于兼容express的路由判断
        validateCb:
            | ((
                  error: null | Joi.ValidationError,
                  req: ExpressRequest | Record<string, any>,
                  res?: ExpressResponse,
                  next?: NextFunction
              ) => void)
            | undefined = undefined
    ) => {
        let joiObj = params;
        let validation;
        if (isLimitPage) {
            joiObj = {
                ...joiObj,
                page: Joi.number(),
                limit: Joi.number()
            };
        }
        let schema = Joi.object(joiObj);

        if (acceptUnknownParameters) {
            schema = schema.unknown();
        }

        if (!req.query && !req.body) {
            validation = req;
        } else {
            validation = method === 'get' ? req.query : req.body;
        }
        const { error } = schema.validate(validation);

        if (validateCb && typeof validateCb === 'function') {
            await validateCb(error ?? null, req, res, next);
        } else {
            next && next(error);
        }
    };

export default function Validate(...arr: Parameters<typeof joiValidationCallback>) {
    return (target: Object, name: string, _descriptor: PropertyDescriptor) => {
        methodMiddleware(target, name, joiValidationCallback(...arr));
    };
}
