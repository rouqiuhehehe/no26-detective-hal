import { Status } from '@src/config/server_config';
import HttpError from '@src/models/httpError';
import Joi from 'joi';
import { RouteMethod } from './controller';
import { methodMiddleware } from './middlewareHandle';

const callback =
    <T = any, isStrict = false>(
        params: Joi.SchemaMap<T, isStrict>,
        errcb?: 'redirect' | ((err?: Joi.ValidationError) => void)
    ) =>
    (method: RouteMethod) =>
    (req: ExpressRequest, res: ExpressResPonse, next: NextFunction) => {
        const schema = Joi.object(params);

        const { error } = schema.validate(method === 'get' ? req.query : req.body);

        if (error) {
            if (errcb) {
                if (typeof errcb === 'function') {
                    errcb(error);
                } else if (errcb === 'redirect') {
                    res.error(error.message);
                    res.redirect('back');
                }
            } else {
                next(new HttpError(Status.SERVER_ERROR, error.message));
            }
        } else {
            next();
        }
    };
export default function Validate(...arr: Parameters<typeof callback>) {
    return (target: Object, name: string, _descriptor: PropertyDescriptor) => {
        methodMiddleware(target, name, callback(...arr));
    };
}
