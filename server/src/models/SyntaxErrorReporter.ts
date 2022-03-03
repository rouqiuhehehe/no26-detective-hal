// 捕获函数名和形参名
const FUNCTION_REGEXP = /^function ([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s?(\([^\)]*\))[\s\S]+$/;
const GENERIC_FUNCTION_ERROR = '{{child}} does not properly override {{parent}}';

export default class SyntaxErrorReporter {
    public constructor(
        private parentClass: Object,
        private childrenClass: Object,
        private parentDescriptor: PropertyDescriptor | undefined,
        private childrenDescriptor: PropertyDescriptor,
        private key: string | symbol
    ) {}

    public assert(condition: boolean, msg = '') {
        if (!condition) {
            this.error(GENERIC_FUNCTION_ERROR + msg);
        }
    }

    public error(msg: string) {
        throw new SyntaxError(
            msg.replace('{{child}}', () => this.childNotation).replace('{{parent}}', () => this.parentNotation)
        );
    }

    private get parentNotation() {
        return `${this.parentClass.constructor.name}#${this.parentPropertySignature.toString()}`;
    }

    private get childNotation() {
        return `${this.childrenClass.constructor.name}#${this.childPropertySignature.toString()}`;
    }

    private get parentPropertySignature() {
        return this.extractTopicSignature(this.parentTopic);
    }

    private get childPropertySignature() {
        return this.extractTopicSignature(this.childTopic);
    }

    private get parentTopic() {
        return this.getTopic(this.parentDescriptor);
    }

    private get childTopic() {
        return this.getTopic(this.childrenDescriptor);
    }

    private getTopic(descriptor?: PropertyDescriptor) {
        if (descriptor === undefined) {
            return null;
        }

        if ('value' in descriptor) {
            return descriptor.value;
        }

        if ('get' in descriptor) {
            return descriptor.get;
        }

        if ('set' in descriptor) {
            return descriptor.set;
        }
    }

    private extractTopicSignature(topic: any) {
        switch (typeof topic) {
            case 'function':
                return this.extractFunctionSignature(topic);
            default:
                return this.key;
        }
    }

    private extractFunctionSignature(fn: Function) {
        return fn.toString().replace(FUNCTION_REGEXP, '$1$2');
    }
}
