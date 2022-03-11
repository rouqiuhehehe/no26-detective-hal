import { DirectiveBinding } from 'vue/types/options';

function addWaterMarker(str: string, parentNode: HTMLElement, font: string, textColor: string) {
    // 水印文字，父元素，字体，文字颜色
    const can = document.createElement('canvas');
    const div = document.createElement('div');

    div.style.pointerEvents = 'none';
    div.style.position = 'absolute';
    div.style.zIndex = '10000000000';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.top = '0';
    div.style.left = '0';
    parentNode.style.position = 'relative';

    parentNode.appendChild(div);
    div.append(can);
    can.width = 200;
    can.height = 150;
    can.style.display = 'none';
    const cans = can.getContext('2d');
    if (cans) {
        cans.rotate((-20 * Math.PI) / 180);
        cans.font = font || '16px Microsoft JhengHei';
        cans.fillStyle = textColor || 'rgba(180, 180, 180, 0.3)';
        cans.textAlign = 'left';
        cans.textBaseline = 'middle';
        cans.fillText(str, can.width / 10, can.height / 2);
    }
    div.style.backgroundImage = 'url(' + can.toDataURL('image/png') + ')';
}

export default {
    bind(el: HTMLElement, binding: DirectiveBinding) {
        addWaterMarker(binding.value.text, el, binding.value.font, binding.value.textColor);
    }
};
