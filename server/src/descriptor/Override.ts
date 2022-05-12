import SyntaxErrorReporter from '@src/models/SyntaxErrorReporter';
import Util, { DescriptorType } from '@util';

const suggestionTransforms = [
    (key: string) => key.toLowerCase(),
    (key: string) => key.toUpperCase(),
    (key: string) => `${key}s`,
    (key: string) => key.slice(0, -1),
    (key: string) => key.slice(1, key.length)
];

function findPossibleAlternatives(superClass: Object, name: string) {
    for (let i = 0, l = suggestionTransforms.length; i < l; i++) {
        const fn = suggestionTransforms[i];
        const suggestion = fn(name);

        if (suggestion in superClass) {
            return suggestion;
        }
    }

    return null;
}

function checkDescriptors(parent: PropertyDescriptor, child: PropertyDescriptor, reporter: SyntaxErrorReporter) {
    const parentType = Util.getFunctionTypeByDescriptor(parent);
    const childType = Util.getFunctionTypeByDescriptor(child);

    if (parentType !== childType) {
        reporter.error(`descriptor types do not match. {parent} is "${parentType}", {child} is "${childType}"`);
    }

    switch (childType) {
        case DescriptorType.DATA:
            checkDataDescriptors(parent, child, reporter);
            break;

        case DescriptorType.ACCESSOR:
            checkAccessorDescriptors(parent, child, reporter);
            break;
    }
}

function checkDataDescriptors(parent: PropertyDescriptor, child: PropertyDescriptor, reporter: SyntaxErrorReporter) {
    const parentValueType = typeof parent.value;
    const childValueType = typeof child.value;

    if (parentValueType === 'undefined' && childValueType === 'undefined') {
        reporter.error(`descriptor values are both undefined. (class properties are are not currently supported)'`);
    }

    if (parentValueType !== childValueType) {
        // 如果parent是undefined，允许子类用处函数外其他类型重写
        const isFunctionOverUndefined = childValueType === 'function' && parentValueType === undefined;
        if (isFunctionOverUndefined || parentValueType !== undefined) {
            reporter.error(
                `value types do not match. {parent} is "${parentValueType}", {child} is "${childValueType}"`
            );
        }
    }

    // Switch, in preparation for supporting more types
    switch (childValueType) {
        case 'function':
            checkFunctionSignatures(parent.value, child.value, reporter);
            break;

        default:
            reporter.error(
                `Unexpected error. Please file a bug with: {parent} is "${parentValueType}", {child} is "${childValueType}"`
            );
            break;
    }
}

function checkAccessorDescriptors(
    parent: PropertyDescriptor,
    child: PropertyDescriptor,
    reporter: SyntaxErrorReporter
) {
    const parentHasGetter = typeof parent.get === 'function';
    const childHasGetter = typeof child.get === 'function';
    const parentHasSetter = typeof parent.set === 'function';
    const childHasSetter = typeof child.set === 'function';

    // 如果有一个get是函数
    if (parentHasGetter || childHasGetter) {
        // 如果父类没有get，但是有set，子类是get函数
        if (!parentHasGetter && parentHasSetter) {
            reporter.error(`{{parent}} is setter but {{child}} is getter`);
        }

        // 如果子类没有get，但是有set，父类是get函数
        if (!childHasGetter && childHasSetter) {
            reporter.error(`{{parent}} is getter but {{child}} is setter`);
        }

        checkFunctionSignatures(parent.get!, child.get!, reporter);
    }

    if (parentHasSetter || childHasSetter) {
        if (!parentHasSetter && parentHasGetter) {
            reporter.error(`{parent} is getter but {child} is setter`);
        }

        if (!childHasSetter && childHasGetter) {
            reporter.error(`{parent} is setter but {child} is getter`);
        }

        checkFunctionSignatures(parent.set!, child.set!, reporter);
    }
}

// 检查函数参数数量是否相等，不相等报错
function checkFunctionSignatures(parent: Function, child: Function, reporter: SyntaxErrorReporter) {
    reporter.assert(parent.length === child.length);
}

export default function Override(
    target: Object,
    name: string | symbol,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    let superClass = Object.getPrototypeOf(target);
    if (superClass.constructor.name === 'ProxyTarget') {
        superClass = Object.getPrototypeOf(superClass);
    }
    const superDescriptor = Object.getOwnPropertyDescriptor(superClass, name);

    const reporter = new SyntaxErrorReporter(superClass, target, superDescriptor, descriptor, name);

    if (superDescriptor === undefined) {
        if (typeof name === 'string') {
            const suggestedKey = findPossibleAlternatives(superClass, name);
            const suggestion = suggestedKey ? `\n\n  Did you mean "${suggestedKey}"?` : '';
            reporter.error(`No descriptor matching {{child}} was found on the prototype chain.${suggestion}`);
        } else {
            reporter.error(`No descriptor matching {{child}} was found on the prototype chain.`);
        }
    } else {
        checkDescriptors(superDescriptor, descriptor, reporter);
    }

    return descriptor;
}
