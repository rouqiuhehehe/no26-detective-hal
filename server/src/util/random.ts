export default class {
    // 生成随机中文的字符串
    public static async randomChinese(len: number) {
        return new Array(len).fill('').reduce((a) => {
            // tslint:disable-next-line:no-magic-numbers no-parameter-reassignment
            a += String.fromCodePoint(Math.round(Math.random() * 20901) + 19968);
            return a;
        }, '');
    }

    // 生成一个随机数字，输入最大数和最小数
    public static randomNumber(max: number, min: number) {
        return parseInt((Math.random() * (max - min + 1) + min).toString(), 10);
    }
}
