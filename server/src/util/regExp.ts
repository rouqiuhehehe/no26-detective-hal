export default class {
    public static chineseAndNumberAndLetter(min: number, max: number) {
        return new RegExp(`^[\\u4E00-\\u9FA5\\da-zA-Z]{${min},${max}}$`);
    }

    public static specialSymbolsRegExp(flags?: string) {
        const regExpStr = '[`~!@#$^&*()=|{}"\':;,\\[\\].<>/?！￥…（）—【】‘；：”“。，、？]';

        return new RegExp(regExpStr, flags);
    }
}
