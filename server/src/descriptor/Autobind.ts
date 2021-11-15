import Util, { DescriptorType } from '@util';
// tslint:disable: no-invalid-this

function autoBind<T extends Function>(target: T): T | void;

function autoBind(target: Object, name: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;

function autoBind<T extends Function>(
    target: T | Object,
    name?: string | symbol,
    descriptor?: PropertyDescriptor
): PropertyDescriptor | void {
    if (descriptor !== undefined && name !== undefined) {
        const fn = Util.getFunctionByDescriptor(descriptor);

        return methodAutoBind(target, name, fn);
    } else {
        const prototype = (target as T).prototype;

        const descriptors = Object.getOwnPropertyDescriptors(prototype);

        for (const key in descriptors) {
            if (key !== 'constructor') {
                const fn = Util.getFunctionByDescriptor(descriptors[key]);
                Object.defineProperty(prototype, key, methodAutoBind(target, key, fn));
            }
        }
    }
}

function methodAutoBind(target: Object, key: string | symbol, fn: ReturnType<typeof Util.getFunctionByDescriptor>) {
    let get: Function;
    let set: Function | undefined;
    if (fn.type === DescriptorType.DATA) {
        get = fn.fn;
    } else if (fn.type === DescriptorType.ACCESSOR) {
        get = fn.fn.get;
        set = fn.fn.set;
    } else {
        throw new TypeError(DescriptorType.UNDEFINED + ' is not a function');
    }

    return {
        configurable: true,
        get() {
            if (Object.prototype.hasOwnProperty.call(this, key) || this === (target as any).prototype) {
                return get;
            }
            Object.defineProperty(this, key, {
                get() {
                    return get.bind(this);
                },
                set() {
                    if (set) {
                        return set.bind(this);
                    }
                },
                configurable: true
            });

            return get.bind(this);
        },
        set() {
            if (set) {
                return set.bind(this);
            }
        }
    };
}

export default autoBind;
