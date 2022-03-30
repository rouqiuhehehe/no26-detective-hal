import Joi from 'joi';
import { RouteMethod } from './controller';
import { methodMiddleware } from './middlewareHandle';

/**
 * @param params joi对象
 * @param isLimitPage 是否为分页接口
 * @param acceptUnknownParameters 是否接收未知参数
 * @param validateCb 后置特殊校验，joi校验成功后触发
 */
export const joiValidationCallback =
    <T = any, isStrict = false>(
        params: Joi.SchemaMap<T, isStrict>,
        isLimitPage = false,
        acceptUnknownParameters = true,
        validateCb?: (
            error: null | Joi.ValidationError,
            req: ExpressRequest,
            res: ExpressResponse,
            next: NextFunction
        ) => void
    ) =>
    (method: RouteMethod) =>
    async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
        let joiObj = params;
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

        const { error } = schema.validate(method === 'get' ? req.query : req.body);

        if (validateCb && typeof validateCb === 'function') {
            await validateCb(error ?? null, req, res, next);
        } else {
            next(error);
        }
    };

export default function Validate(...arr: Parameters<typeof joiValidationCallback>) {
    return (target: Object, name: string, _descriptor: PropertyDescriptor) => {
        methodMiddleware(target, name, joiValidationCallback(...arr));
    };
}
