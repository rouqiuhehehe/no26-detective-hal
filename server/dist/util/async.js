"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    seriesLimit(cb, options) {
        const result = [];
        let i = 0;
        let queue = 0;
        let error = false;
        return new Promise(async (resolve, reject) => {
            if (cb.length === 0) {
                return resolve(result);
            }
            const newCb = cb.map((v) => {
                return (time) => {
                    const now = time;
                    const callback = (...arg) => {
                        const afterNow = Date.now();
                        if (afterNow - now >= options.time) {
                            reject(new Error(v.toString() + 'timeout'));
                            error = true;
                        }
                        i++;
                        queue--;
                        for (const item of arg) {
                            if (item instanceof Error) {
                                reject(item);
                                error = true;
                            }
                        }
                        result.push(...arg);
                        if (i === cb.length) {
                            resolve(result);
                        }
                    };
                    v.call(null, callback);
                };
            });
            const generator = this.generatorCallback(newCb);
            try {
                const timer = setInterval(async () => {
                    if (queue < options.limit) {
                        queue++;
                        const time = Date.now();
                        const { done, value } = await generator.next();
                        if (!done && !error) {
                            value(time);
                        }
                        else {
                            clearInterval(timer);
                        }
                    }
                }, 10);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    waterfall(fn, ...cb) {
        let finished = false;
        let params;
        let i = 0;
        return new Promise(async (resolve, reject) => {
            const callback = (...arg) => {
                finished = true;
                for (const item of arg) {
                    if (item instanceof Error) {
                        reject(item);
                    }
                }
                params = arg;
            };
            fn(callback);
            const timer = setInterval(async () => {
                if (finished) {
                    clearInterval(timer);
                    try {
                        await cb[i](params, callback);
                        const timer = setInterval(async () => {
                            if (finished) {
                                finished = false;
                                i++;
                                if (i === cb.length) {
                                    clearInterval(timer);
                                    return resolve(params);
                                }
                                await cb[i](params, callback);
                            }
                        }, 10);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            }, 10);
        });
    }
    series(...cb) {
        const result = [];
        let i = 0;
        return new Promise(async (resolve, reject) => {
            if (cb.length === 0) {
                return resolve(result);
            }
            const newCb = cb.map((v) => {
                return () => {
                    const callback = (...arg) => {
                        i++;
                        for (const item of arg) {
                            if (item instanceof Error) {
                                reject(item);
                            }
                        }
                        result.push(...arg);
                        if (i === cb.length) {
                            resolve(result);
                        }
                    };
                    v.call(null, callback);
                };
            });
            const generator = this.generatorCallback(newCb);
            try {
                while (true) {
                    const { done, value } = await generator.next();
                    if (!done) {
                        value();
                    }
                    else {
                        return;
                    }
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    parallel(...cb) {
        let finished = false;
        const result = [];
        return new Promise(async (resolve, reject) => {
            if (cb.length === 0) {
                return resolve(result);
            }
            const newCb = cb.map((v) => {
                return () => {
                    const callback = (...arg) => {
                        finished = true;
                        for (const item of arg) {
                            if (item instanceof Error) {
                                reject(item);
                            }
                        }
                        result.push(...arg);
                    };
                    v.call(null, callback);
                };
            });
            const generator = this.generatorCallback(newCb);
            try {
                await generator.next();
                const timer = setInterval(async () => {
                    if (finished) {
                        finished = false;
                        const { done, value } = await generator.next();
                        if (!done) {
                            value();
                        }
                        else {
                            clearInterval(timer);
                            resolve(result);
                        }
                    }
                }, 10);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    *generatorCallback(cb) {
        const len = cb.length;
        let i = 0;
        while (i < len) {
            try {
                yield cb[i];
                i++;
            }
            catch (e) {
                throw e;
            }
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=async.js.map