function binaryIntToDecimalInt(int: string) {
    let decimalInt = 0.0;
    if (int) {
        for (let i = int.length - 1; i >= 0; i--) {
            if (+int[i] === 1) {
                decimalInt += Math.pow(2, int.length - 1 - i);
            }
        }
    }
    return decimalInt;
}

function binaryFloatToDecimalFloat(float: string) {
    let decimalFloat = 0.0;
    if (float) {
        for (let i = 0; i < float.length; i++) {
            if (+float[i] === 1) {
                decimalFloat += Math.pow(2, -(i + 1));
            }
        }
    }
    return decimalFloat;
}

function decimalIntToBinaryInt(int: string) {
    const binaryInt = [];
    let newInt = +int;
    if (int) {
        while (newInt !== 0 && newInt !== 1) {
            binaryInt.unshift(newInt % 2);
            newInt = Math.floor(newInt / 2);
        }
        binaryInt.unshift(newInt);
    }
    return binaryInt.join('');
}

function decimalFloatToBinaryFloat(float: string, precision: number) {
    const binaryFloat = [];
    let newFloat = +`0.${float}`;
    if (float) {
        while (binaryFloat.length < precision) {
            const [int, parseFloat] = (newFloat * 2).toString().split('.');
            binaryFloat.push(int);
            if (parseFloat === undefined) {
                break;
            }
            newFloat = +`0.${parseFloat}`;
        }
    }
    return binaryFloat.join('');
}

export default class {
    public static binaryToDecimal(num: number | string) {
        const arr = num.toString().split('.');
        if (arr.length === 1 || arr.length === 2) {
            const [int, float] = arr;
            const sign = int.slice(0, 1) === '-' ? '-' : '';
            return (
                sign +
                (binaryIntToDecimalInt(sign === '-' ? int.replace(sign, '') : int) + binaryFloatToDecimalFloat(float))
            );
        } else {
            throw new Error('请传入一个数字');
        }
    }

    public static decimalToBinary(num: number | string, precision = 64) {
        const arr = num.toString().split('.');
        if (arr.length === 1 || arr.length === 2) {
            const [int, float] = arr;
            const sign = int.slice(0, 1) === '-' ? '-' : '';
            const newInt = `${sign}${decimalIntToBinaryInt(sign === '-' ? int.replace(sign, '') : int)}`;
            const newFloat = decimalFloatToBinaryFloat(float, precision);
            if (newFloat) {
                return `${newInt}.${newFloat}`;
            }
            return newInt;
        } else {
            throw new Error('请传入一个数字');
        }
    }
}
