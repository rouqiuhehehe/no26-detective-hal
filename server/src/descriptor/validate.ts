import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import Joi from 'joi';
import { RouteMethod } from './controller';
import { methodMiddleware } from './middlewareHandle';

const callback =
    <T = any, isStrict = false>(
        params: Joi.SchemaMap<T, isStrict>,
        isLimitPage = false,
        acceptUnknownParameters = true,
        validateCb?: () => void,
        errcb?: (err: Joi.ValidationError) => void
    ) =>
    (method: RouteMethod) =>
    async (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
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

        if (error) {
            errorHandle(errcb, error, next);
        } else {
            if (validateCb) {
                try {
                    await validateCb();
                    next();
                } catch (error: any) {
                    errorHandle(errcb, error, next);
                }
            } else {
                next();
            }
        }
    };

const errorHandle = <T extends Error>(errcb: ((err: T) => void) | undefined, error: T, next: NextFunction) => {
    if (errcb) {
        if (typeof errcb === 'function') {
            errcb(error);
        }
    } else {
        next(new HttpError(Status.SERVER_ERROR, error.message));
    }
};
export default function Validate(...arr: Parameters<typeof callback>) {
    return (target: Object, name: string, _descriptor: PropertyDescriptor) => {
        methodMiddleware(target, name, callback(...arr));
    };
}
