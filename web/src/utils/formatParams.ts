export default function formatParams<T>(obj: T): T | Record<string, unknown> {
    const params = {};
    function _(objC: T, params: Record<string, unknown>) {
        const C = <A, U extends keyof A>(o: A, name: U): A[U] => {
            return o[name];
        };
        for (const i in objC) {
            const item = C(objC, i);
            if (typeof item === 'boolean' || typeof item === 'number') {
                params[i] = item;
                continue;
            }
            if (!item) {
                delete params[i];
                continue;
            } else {
                if (item instanceof Array) {
                    if (item.length === 0) {
                        delete params[i];
                        continue;
                    } else {
                        params[i] = item;
                        continue;
                    }
                } else if (item instanceof Object) {
                    params[i] = item;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _(item as any, params[i] as Record<string, unknown>);
                    if (JSON.stringify(params[i]) === '{}') delete params[i];
                    continue;
                }
                params[i] = item;
            }
        }
    }
    _(obj, params);
    return params;
}
