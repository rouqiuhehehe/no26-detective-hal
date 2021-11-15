import Joi from 'joi';
import { RouteMethod } from './controller';
declare const callback: <T = any, isStrict = false>(params: Joi.SchemaMap<T, isStrict>, errcb?: "redirect" | ((err?: Joi.ValidationError | undefined) => void) | undefined) => (method: RouteMethod) => (req: ExpressRequest, res: ExpressResPonse, next: NextFunction) => void;
export default function Validate(...arr: Parameters<typeof callback>): (target: Object, name: string, _descriptor: PropertyDescriptor) => void;
export {};
