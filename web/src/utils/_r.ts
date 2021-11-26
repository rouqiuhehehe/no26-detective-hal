export default function (a: number) {
    const c = Math.abs(parseInt(new Date().getTime() * Math.random() * 10000 + '')).toString();
    let d = 0;
    for (let b = 0; b < c.length; b++) {
        d += parseInt(c[b]);
    }
    const e = (function (f) {
        return function (g: number, h: number) {
            return (f[h] || (f[h] = Array(h + 1).join('0'))) + g;
        };
    })([] as string[]);
    d += c.length;
    const f = e(d, 3 - d.toString().length);
    return a.toString() + c + f;
}
