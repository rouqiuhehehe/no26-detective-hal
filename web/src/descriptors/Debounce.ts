// 防抖
export default (delay: number): ((target: unknown, name: string, descriptor: PropertyDescriptor) => void) => {
    let timer: number;
    return (target, name, descriptor) => {
        const func = descriptor.value as (...arg: unknown[]) => unknown;
        if (typeof func === 'function') {
            descriptor.value = function (...arg: unknown[]) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(this, arg);
                }, delay);
            };
        }
    };
};
