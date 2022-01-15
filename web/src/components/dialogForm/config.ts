import { MyDialog } from '@/types/components';

export default class {
    public bind = [
        'ref',
        'title',
        'width',
        'fullscreen',
        'top',
        'modal',
        'modalAppendToBody',
        'lockScroll',
        'customClass',
        'closeOnClickModal',
        'closeOnPressEscape',
        'showClose',
        'beforeClose',
        'center',
        'destroyOnClose'
    ];

    public default: {
        title: string;
        width: string;
        ref: string;
        beforeClose: (done?: (() => void) | undefined) => void;
        center: boolean;
    };

    public constructor(
        public defaultFn: {
            beforeClose: (
                beforeClose?: ((options: MyDialog) => boolean) | undefined
            ) => (done?: (() => void) | undefined) => void;
        }
    ) {
        this.default = {
            title: '提示',
            width: '70%',
            ref: 'my-dialog-form',
            beforeClose: this.defaultFn.beforeClose(),
            center: false
        };
    }
}
