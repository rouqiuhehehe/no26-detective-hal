export default class {
    seriesLimit<T>(cb: ((callback: (...arg: T[]) => void) => void)[], options: {
        time: number;
        limit: number;
    }): Promise<T[]>;
    waterfall<T>(fn: (callback: (...arg: T[]) => void) => void, ...cb: ((arg: T[], callback: (...arg: T[]) => void) => void)[]): Promise<T[]>;
    series<T>(...cb: ((callback: (...arg: T[]) => void) => void)[]): Promise<T[]>;
    parallel<T>(...cb: ((callback: (...arg: T[]) => void) => void)[]): Promise<T[]>;
    private generatorCallback;
}
