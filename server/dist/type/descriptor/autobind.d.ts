declare function autoBind<T extends Function>(target: T): T | void;
declare function autoBind(target: Object, name: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
export default autoBind;
