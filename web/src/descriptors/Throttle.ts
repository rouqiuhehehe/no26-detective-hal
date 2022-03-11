/**
 * 节流函数
 * time 时间
 * startExecution 是否需要开始时就触发一次
 * endExecution 是否需要结束时触发一次
 * */
export default (
    time: number,
    startExecution = false,
    endExecution = false
): ((target: unknown, name: string, descriptor: PropertyDescriptor) => void) => {
    let prev: number, timer: number | null;
    return (target, name, descriptor) => {
        const func = descriptor.value as (...arg: unknown[]) => unknown;
        if (typeof func === 'function') {
            if (!endExecution) {
                descriptor.value = function (...args: unknown[]) {
                    const now = new Date().getTime();
                    if (prev && now - prev > time) {
                        func.apply(this, args);
                        prev = new Date().getTime();
                    } else {
                        prev = new Date().getTime();
                        startExecution && func.apply(this, args);
                    }
                };
            } else {
                descriptor.value = function (...args: unknown[]) {
                    if (timer) return;
                    else {
                        timer = setTimeout(() => {
                            func.apply(this, args);
                            timer = null;
                        }, time);
                        if (!startExecution) return;
                        else {
                            func.apply(this, args);
                            startExecution = false;
                        }
                    }
                };
            }
        }
    };
};
