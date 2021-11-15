import Joi from 'joi';
import Validate from './validate';

/**
 * +号定义number，!定义string。
 * 如!name，+age
 * 如需特殊校验，请使用@Validate
 */
export default function Required<isStrict = false>(arr: string[]) {
    const stringRegExp = /^\!/;
    const numberRegExp = /^\+/;
    const joiObject = arr.reduce((a, v) => {
        const isString = stringRegExp.test(v);
        const isNumber = numberRegExp.test(v);

        if (v in a) {
            throw new RangeError('Please do not add duplicate verification');
        } else {
            if (isString) {
                a[v.slice(1)] = Joi.string().required();
            } else if (isNumber) {
                a[v.slice(1)] = Joi.number().required();
            } else {
                a[v] = Joi.required();
            }
        }
        return a;
        // tslint:disable-next-line: no-object-literal-type-assertion
    }, {} as Joi.SchemaMap<any, isStrict>);

    return Validate(joiObject);
}
