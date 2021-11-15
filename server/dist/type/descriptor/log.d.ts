declare function Log(dev?: 'dev'): (target: Object | Function, propertyKey?: string | symbol | undefined, descriptor?: PropertyDescriptor | undefined) => void;
export default Log;
