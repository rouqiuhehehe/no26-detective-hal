import { DirectiveBinding, DirectiveOptions } from 'vue/types/options';
import Vue from 'vue';

const createTooltip = (content: string, el: HTMLElement) => {
    // 创建构造器
    const tooltip = Vue.extend({
        template: `<el-tooltip placement="top" effect="light" content="${content}">${el.outerHTML}</el-tooltip>`
    });
    // 创建一个 tooltip 实例并返回 dom 节点
    return new tooltip().$mount();
};
export default {
    bind(el: HTMLElement, binding: DirectiveBinding) {
        const {
            value: { content, width }
        } = binding;
        el.style.width = width || '100px';
        el.style.whiteSpace = 'nowrap';
        el.style.overflow = 'hidden';
        el.style.display = 'block';
        el.style.textOverflow = 'ellipsis';
        const component = createTooltip(content, el);
        Promise.resolve().then(() => {
            const { parentNode } = el;
            // 判断文字是否溢出
            if (el.scrollWidth > el.offsetWidth)
                if (parentNode) {
                    (parentNode as any).tooltipElement = component.$el;
                    parentNode.removeChild(el);
                    parentNode.append(component.$el);
                    (el as any).parentEl = parentNode;
                    (el as any).childrenEl = component.$el;
                }
        });
    },
    update(el, binding) {
        const {
            value: { content }
        } = binding;
        const component = createTooltip(content, el);
        (el as any).parentEl.removeChild((el as any).childrenEl);
        (el as any).parentEl.append(component.$el);
        (el as any).childrenEl = component.$el;
    }
} as DirectiveOptions;
