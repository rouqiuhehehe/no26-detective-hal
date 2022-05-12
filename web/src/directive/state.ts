import { DirectiveBinding } from 'vue/types/options';

export enum DomState {
    SHOW = 2,
    HIDDEN = 2 << 1,
    DISABLED = 2 << 2
}

export default (el: HTMLElement, binding: DirectiveBinding) => {
    const { value } = binding;
    switch (value) {
        case DomState.SHOW:
            el.style.display = 'block';
            el.classList.remove('is-disabled');
            el['disabled'] = false;
            break;
        case DomState.HIDDEN:
            el.style.display = 'none';
            el.classList.remove('is-disabled');
            el['disabled'] = false;
            break;
        case DomState.DISABLED:
            el.style.display = 'block';
            el.classList.add('is-disabled');
            el['disabled'] = true;
            break;
    }
};
