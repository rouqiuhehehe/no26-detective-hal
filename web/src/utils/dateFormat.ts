interface O {
    [key: string]: number | string;
}

export default function (dft: Date | string, format: string): string {
    const dateObj = new Date(dft);
    let k;
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    const o: O = {
        'M+': dateObj.getMonth() + 1,
        'd+': dateObj.getDate(),
        'h+': dateObj.getHours() % 12,
        'H+': dateObj.getHours(),
        'm+': dateObj.getMinutes(),
        's+': dateObj.getSeconds(),
        'q+': Math.floor((dateObj.getMonth() + 3) / 3),
        'S+': dateObj.getMilliseconds(),
        'W+': week[dateObj.getDay()]
    };

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? `${o[k]}` : ('00' + o[k]).substr(('' + o[k]).length)
            );
        }
    }

    if (!dft) {
        return '';
    }

    return format;
}
