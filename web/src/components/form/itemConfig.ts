/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    MyCascader,
    MyCheckbox,
    MyCheckboxGroup,
    MyDatePicker,
    MyImgUpload,
    MyInput,
    MyInputNumber,
    MyRadio,
    MySelect,
    MySwitch,
    MyText
} from '@/types/components';

export default class {
    public typeMap = new Map([
        [
            'radio',
            {
                component: 'el-radio',
                defaultValue: (item: MyRadio) => '',
                bind: [],
                defaultBind: {},
                events: ['change']
            }
        ],
        [
            'checkbox',
            {
                component: 'el-checkbox',
                defaultValue: (item: MyCheckbox) => true,
                defaultBind: {},
                events: ['change']
            }
        ],
        [
            'checkboxGroup',
            {
                component: 'el-checkbox-group',
                defaultValue: (item: MyCheckboxGroup) => [],
                defaultBind: {},
                events: ['change']
            }
        ],
        [
            'input',
            {
                component: 'el-input',
                defaultValue: (item: MyInput) => '',
                defaultBind: {
                    clearable: true
                },
                events: ['change', 'blur', 'focus', 'clear', 'input'],
                bind: [
                    'type',
                    'value',
                    'maxlength',
                    'minlength',
                    'placeholder',
                    'disabled',
                    'size',
                    'prefixIcon',
                    'suffixIcon',
                    'rows',
                    'autosize',
                    'autoComplete',
                    'autocomplete',
                    'name',
                    'readonly',
                    'max',
                    'min',
                    'step',
                    'resize',
                    'autofocus',
                    'form',
                    'validateEvent',
                    'clearable',
                    'showPassword',
                    'showWordLimit'
                ]
            }
        ],
        [
            'number',
            {
                component: 'el-input-number',
                defaultValue: (item: MyInputNumber) => 0,
                defaultBind: {
                    controlsPosition: 'right'
                },
                events: ['change', 'blur', 'focus']
            }
        ],
        [
            'select',
            {
                component: 'el-select',
                defaultValue: (item: MySelect) => (item.multiple ? [] : ''),
                defaultBind: {
                    clearable: 'true'
                },
                events: ['change', 'visible-change', 'remove-tag', 'clear', 'blur', 'focus']
            }
        ],
        [
            'cascader',
            {
                component: 'el-cascader',
                defaultValue: (item: MyCascader) => [],
                defaultBind: {
                    clearable: 'true'
                },
                events: ['change', 'blur', 'clear', 'focus', 'remove-tag', 'visible-change', 'expand-change']
            }
        ],
        [
            'switch',
            {
                component: 'el-switch',
                defaultValue: (item: MySwitch) => false,
                defaultBind: {},
                events: ['change']
            }
        ],
        [
            'date',
            {
                component: 'el-date-picker',
                defaultValue: (item: MyDatePicker) =>
                    item.type === 'datetimerange' || item.type === 'daterange' ? [] : '',
                defaultBind: {
                    rangeSeparator: '-',
                    startPlaceholder: '开始时间',
                    endPlaceholder: '结束时间'
                },
                events: ['change', 'blur', 'focus']
            }
        ],
        [
            'text',
            {
                component: 'div',
                defaultValue: (item: MyText) => '',
                events: []
            }
        ],
        [
            'imgUpload',
            {
                component: 'img-upload',
                defaultValue: (item: MyImgUpload) => [],
                defaultBind: {
                    action: '#',
                    listType: 'picture-card',
                    autoUpload: true
                },
                events: [],
                bind: [
                    'action',
                    'headers',
                    'multiple',
                    'data',
                    'name',
                    'withCredentials',
                    'showFileList',
                    'drag',
                    'accept',
                    'onPreview',
                    'onRemove',
                    'onSuccess',
                    'onError',
                    'onProgress',
                    'onChange',
                    'beforeUpload',
                    'thumbnailMode',
                    'fileList',
                    'listType',
                    'autoUpload',
                    'disabled',
                    'limit',
                    'onExceed'
                ]
            }
        ]
    ]);
}
