// 拖拽
import { DirectiveOptions } from 'vue/types/options';

export default {
    inserted(el) {
        el.style.cursor = 'move';
        const { position } = window.getComputedStyle(el);
        if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
            el.style.position = 'absolute';
        }
        el.onmousedown = (e) => {
            const disx = e.pageX - el.offsetLeft;
            const disy = e.pageY - el.offsetTop;

            document.onmousemove = (e) => {
                let x = e.pageX - disx;
                let y = e.pageY - disy;
                const maxX = document.body.clientWidth - parseInt(window.getComputedStyle(el).width);
                const maxY = document.body.clientHeight - parseInt(window.getComputedStyle(el).height);
                if (x < 0) {
                    x = 0;
                } else if (x > maxX) {
                    x = maxX;
                }

                if (y < 0) {
                    y = 0;
                } else if (y > maxY) {
                    y = maxY;
                }

                el.style.left = x + 'px';
                el.style.top = y + 'px';
            };

            document.onmouseup = () => {
                document.onmouseup = document.onmousemove = null;
            };
        };
    }
} as DirectiveOptions;
