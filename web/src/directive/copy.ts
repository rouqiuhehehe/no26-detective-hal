import { DirectiveOptions } from 'vue/types/options';
import { Message } from 'element-ui';

export enum CopyModel {
    ICON = 'icon',
    DBLCLICK = 'dblclick'
}

const handler = (value: string) => () => {
    let input = document.getElementById('copyTarget') as HTMLInputElement;
    if (!input) {
        input = document.createElement('input');
        input.style.opacity = '0';
        input.style.position = 'fixed';
        input.style.left = '0';
        input.style.top = '0';
        input.id = 'copyTarget';
        document.body.append(input);
    }

    input.value = value;
    input.select();
    document.execCommand('copy', true);
    Message.success('复制成功！');
    document.body.removeChild(input);
};
/**
 * 鼠标左键copy事件，用法 v-copy="status"
 * status 取值 icon | dblclick，默认值单击复制
 */
export default {
    bind(el, binding) {
        const { value } = binding;
        const handlerClick = handler(el.innerText);

        if (!value) {
            el.style.cursor = 'copy';
            el.addEventListener('click', handlerClick);
        } else {
            switch (value) {
                case CopyModel.ICON:
                    if (!(el as any).hasIcon) {
                        const icon = document.createElement('i');
                        icon.classList.add('el-icon-document-copy');
                        icon.style.marginLeft = '5px';
                        icon.style.cursor = 'copy';
                        el.append(icon);
                        (el as any).hasIcon = true;
                        icon.addEventListener('click', handlerClick);
                    }
                    break;
                case CopyModel.DBLCLICK:
                    el.style.cursor = 'copy';
                    el.addEventListener('dblclick', handlerClick);
            }
        }
    }
} as DirectiveOptions;
