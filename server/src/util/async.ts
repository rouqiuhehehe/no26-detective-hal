export default class {
    /**
     * 并行，可设置最大异步数以及超时时间
     */
    public seriesLimit<T>(
        cb: ((callback: (...arg: T[]) => void) => void)[],
        options: {
            time: number;
            limit: number;
        }
    ): Promise<T[]> {
        const result: T[] = [];
        let i = 0;
        let queue = 0;
        let error = false;

        return new Promise(async (resolve, reject) => {
            if (cb.length === 0) {
                return resolve(result);
            }

            const newCb = cb.map((v) => {
                return (time: number) => {
                    const now = time;
                    const callback = (...arg: T[]) => {
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
                            value!(time);
                        } else {
                            clearInterval(timer);
                        }
                    }
                }, 10);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * 每一次callback拿到的参数，传给下一个函数的第一个参数，最终返回最后一个函数的callback参数
     */
    public waterfall<T>(
        fn: (callback: (...arg: T[]) => void) => void,
        ...cb: ((arg: T[], callback: (...arg: T[]) => void) => void)[]
    ): Promise<T[]> {
        let finished = false;
        let params: T[];
        let i = 0;

        return new Promise(async (resolve, reject) => {
            const callback = (...arg: T[]) => {
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
                    } catch (e) {
                        reject(e);
                    }
                }
            }, 10);
        });
    }

    /**
     * 并行函数，不造成阻塞，全部完成返回结果
     */
    public series<T>(...cb: ((callback: (...arg: T[]) => void) => void)[]): Promise<T[]> {
        const result: T[] = [];
        let i = 0;

        return new Promise(async (resolve, reject) => {
            if (cb.length === 0) {
                return resolve(result);
            }

            const newCb = cb.map((v) => {
                return () => {
                    const callback = (...arg: T[]) => {
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
                        value!();
                    } else {
                        return;
                    }
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * 并行函数，按序执行，会阻塞
     */
    public parallel<T>(...cb: ((callback: (...arg: T[]) => void) => void)[]): Promise<T[]> {
        let finished = false;
        const result: T[] = [];

        return new Promise(async (resolve, reject) => {
            if (cb.length === 0) {
                return resolve(result);
            }
            const newCb = cb.map((v) => {
                return () => {
                    const callback = (...arg: T[]) => {
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
                            value!();
                        } else {
                            clearInterval(timer);
                            resolve(result);
                        }
                    }
                }, 10);
            } catch (e) {
                reject(e);
            }
        });
    }

    private *generatorCallback<T extends Function>(cb: T[]) {
        const len = cb.length;
        let i = 0;
        while (i < len) {
            try {
                yield cb[i];
                i++;
            } catch (e) {
                throw e;
            }
        }
    }
}
