export default class {
    public static chineseAndNumberAndLetter(min: number, max: number) {
        return new RegExp(`^[\\u4E00-\\u9FA5\\da-zA-Z]{${min},${max}}$`);
    }
}
