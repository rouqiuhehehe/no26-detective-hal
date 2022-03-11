import { DirectiveOptions } from 'vue/types/options';
import Util from '@/utils';

/**
 * 鼠标左键长按事件，用法 v-longpress:time="callback"
 * time传时间，callback传函数
 */
export default {
    bind(el, binding) {
        const { arg, value: callback } = binding;

        if (typeof callback !== 'function') {
            throw new SyntaxError(`${callback?.toString()} is not a function`);
        }

        if (!arg || isNaN(+arg)) {
            throw new SyntaxError(`${arg?.toString()} is not a number`);
        }

        let timer: number | null = null;

        const handler = (e: MouseEvent | TouchEvent) => {
            callback(e);
        };

        /*
         * 0：主按键，通常指鼠标左键或默认值（译者注：如document.getElementById('a').click()这样触发就会是默认值）
         * 1：辅助按键，通常指鼠标滚轮中键
         * 2：次按键，通常指鼠标右键
         * 3：第四个按钮，通常指浏览器后退按钮
         * 4：第五个按钮，通常指浏览器的前进按钮
         */
        const start = (e: MouseEvent | TouchEvent) => {
            // 只接受鼠标左键的长按
            if (e.type === 'click' && 'button' in e && e.button !== 0) {
                return false;
            }

            if (!timer) {
                timer = setTimeout(handler.bind(null, e), +arg);
            }
        };

        const cancel = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };

        const env = Util.isMobile();

        (el as any)._longpress_start = start;
        (el as any)._longpress_cancel = cancel;

        if (env) {
            el.addEventListener('touchstart', start);
            el.addEventListener('touchend', cancel);
            el.addEventListener('touchcancel', cancel);
        } else {
            el.addEventListener('mousedown', start);
            el.addEventListener('click', cancel);
            el.addEventListener('mouseout', cancel);
        }
    },
    // 指令与元素解绑的时候，移除事件绑定
    unbind(el) {
        const env = Util.isMobile();
        const { _longpress_start: start, _longpress_cancel: cancel } = el as any;
        if (env) {
            el.removeEventListener('touchstart', start);
            el.removeEventListener('touchend', cancel);
            el.removeEventListener('touchcancel', cancel);
        } else {
            el.removeEventListener('mousedown', start);
            el.removeEventListener('click', cancel);
            el.removeEventListener('mouseout', cancel);
        }
    }
} as DirectiveOptions;
