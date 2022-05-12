import { DirectiveBinding, DirectiveOptions } from 'vue/types/options';

export default {
    inserted(el: HTMLElement, binding: DirectiveBinding) {
        const {
            value: { width }
        } = binding;
        el.style.width = width || '100px';
        el.style.whiteSpace = 'nowrap';
        el.style.overflow = 'hidden';
        el.style.display = 'block';
        el.style.textOverflow = 'ellipsis';
    }
} as DirectiveOptions;
