import { MyForm } from '@/types/components';

export default class {
    public bind = [
        'disabled',
        'labelPosition',
        'labelWidth',
        'labelSuffix',
        'showMessage',
        'inlineMessage',
        'statusIcon',
        'validateOnRuleChange',
        'size',
        'ref'
    ];

    public formItemBind = ['label', 'labelWidth', 'error', 'showMessage', 'inlineMessage', 'size'];

    public default: Partial<MyForm> = {
        labelWidth: '80px',
        labelPosition: 'right',
        hideRequiredAsterisk: true
    };
}
