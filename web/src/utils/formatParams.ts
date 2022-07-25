import Util from '.';

export default function formatParams(obj: Record<string, unknown>): Record<string, unknown> {
    const params = {};

    function _(objC: Record<string, unknown>, params: Record<string, unknown>) {
        for (const i in objC) {
            if (Reflect.has(objC, i)) {
                const item = objC[i];
                if (!item) {
                    continue;
                }
                if (typeof item !== 'object') {
                    params[i] = item;
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
                        if (Util.isEmpty(params[i])) delete params[i];
                        continue;
                    }
                    params[i] = item;
                }
            }
        }
    }

    _(obj, params);
    return params;
}
