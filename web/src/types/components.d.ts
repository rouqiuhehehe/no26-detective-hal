import { ElCascader } from 'element-ui/types/cascader';
import { ElCheckbox } from 'element-ui/types/checkbox';
import { ElCheckboxGroup } from 'element-ui/types/checkbox-group';
import { ElementUIComponent, ElementUIComponentSize } from 'element-ui/types/component';
import { ElDatePicker } from 'element-ui/types/date-picker';
import { FormItemLabelPosition } from 'element-ui/types/form';
import { ElInput } from 'element-ui/types/input';
import { ElInputNumber } from 'element-ui/types/input-number';
import { ElRadio } from 'element-ui/types/radio';
import { ElSelect } from 'element-ui/types/select';
import { ElSwitch } from 'element-ui/types/switch';
import { ElUpload } from 'element-ui/types/upload';
import Vue from 'vue';
import { AxiosError } from './store';

/**
 * 表格数据
 * view接口数据
 * 提交表单返回数据，默认为{ value:boolean }
 */
/* eslint-disable @typescript-eslint/ban-types */
export interface MyDialog {
    title?: string;
    width?: string;
    fullscreen?: boolean;
    top?: string;
    modal?: boolean;
    modalAppendToBody?: boolean;
    lockScroll?: boolean;
    customClass?: string;
    closeOnClickModal?: boolean;
    closeOnPressEscape?: boolean;
    showClose?: boolean;
    beforeClose?: (options: MyDialog) => boolean;
    center?: boolean;
    destroyOnClose?: boolean;
    ref?: string;
    form?: MyDialogForm;
}

export type FormType = 'edit' | 'search';

export type Columns =
    | MyInput
    | MySelect
    | MyCheckbox
    | MyCheckboxGroup
    | MyRadio
    | MyInputNumber
    | MyCascader
    | MyDatePicker
    | MySwitch
    | MyText
    | MyImgUpload;

export interface MyForm {
    /** Whether the form is disabled */
    disabled?: boolean;

    /** Position of label */
    labelPosition?: FormItemLabelPosition;

    /** Width of label, and all form items will inherit from Form */
    labelWidth?: string;

    /** Suffix of the label */
    labelSuffix?: string;

    /** Whether to show the error message */
    showMessage?: boolean;

    /** Whether to display the error message inline with the form item */
    inlineMessage?: boolean;

    /** Whether to display an icon indicating the validation result */
    statusIcon?: boolean;

    /** Whether to trigger validation when the `rules` prop is changed */
    validateOnRuleChange?: boolean;

    /** Controls the size of components in this form */
    size?: ElementUIComponentSize;

    ref?: string;

    columns: Columns[];

    /**
     * 提交接口
     */
    store: FormStore;

    type: FormType;

    beforeRender?: (formData: any) => Record<string, any>;
}

export interface EditForm extends MyForm {
    type: 'edit';
    /**
     * view接口
     */
    viewStore: FormStore<any>;

    viewParams?: (tableColumnsData?: any, tableData?: any[]) => { [K in keyof A]: A[k] } | Record<string, any>;

    beforeCommit?: (
        this: Vue,
        formData: Record<string, any>,
        options: EditForm,
        table: Vue & { [K in keyof any]: any }
    ) => Record<string, any> | false;

    afterCommit?: (
        this: Vue,
        res: T | AxiosError<any>,
        options: EditForm,
        table: Vue & { [K in keyof any]: any }
    ) => void;
}

export interface DefaultForm extends MyForm {
    afterCommit?: (
        this: Vue,
        res: T | AxiosError<any>,
        options: DefaultForm,
        table: Vue & { [K in keyof any]: any }
    ) => void;

    beforeCommit?: (
        this: Vue,
        formData: Record<string, any>,
        options: DefaultForm,
        table: Vue & { [K in keyof any]: any }
    ) => Record<string, any> | false;
}

export type MyDialogForm = EditForm | DefaultForm;

export interface MyFormItem {
    /** Label */
    label: string;

    /** Width of label, e.g. '50px' */
    labelWidth?: string;

    /** Field error message, set its value and the field will validate error and show this message immediately */
    error?: string;

    /** Whether to show the error message */
    showMessage?: boolean;

    /** Whether to display the error message inline with the form item */
    inlineMessage?: boolean;

    /** Controls the size of components in this form */
    size?: ElementUIComponentSize;
}

export interface elRuleObject {
    required?: boolean;
    message?: string;
    type?: string;
    trigger: string;
    validator?: Check;
}
export interface Check {
    (
        rule: { field: string; fullField: string; type: string },
        value: string | null | undefined,
        callback: (sub?: Error) => void
    ): void;
}
export type RequiredType = 'number' | '!number' | 'IdCard' | '!IdCard' | 'chinese' | '!chinese' | 'phone' | '!phone';

export type RequiredRule<T> =
    | true
    | RequiredType
    | ((value: any, options: T, option: Columns[], table: Vue & { [K in keyof any]: any }) => boolean | string);

export interface BaseItemComponent {
    box?: number;
    dataIndex: string;
    xType: string;
}
export type ColumnsStore = ((params: any) => Promise<AxiosResponse<any, any>>) | any[];
export type FormStore = (params: any) => Promise<AxiosResponse<any, any>>;
export interface StoreBase<O> {
    /**
     * axios请求体，或key value数组
     */
    store: ColumnsStore;
    params?: (option: O, columns: Columns, form: MyDialogForm) => Record<string, any>;
    formatKey?: {
        key: string;
        value: string;
    };
}

export type XType =
    | 'radio'
    | 'checkbox'
    | 'checkboxGroup'
    | 'input'
    | 'number'
    | 'select'
    | 'cascader'
    | 'switch'
    | 'date'
    | 'text'
    | 'imgUpload';

/**
 * 获取不继承自vue的单独接口
 */
type GetNoElementUIComponentType<T extends ElementUIComponent> = Diff<T, ElementUIComponent>;
/**
 * 获取不带methods方法的接口
 */
type OmitNoMethodsType<T extends ElementUIComponent> = Omit<T, 'focus' | 'blur' | 'select'>;

type MyElementUIComponentType<T extends ElementUIComponent, U extends XType> = Overwrite<
    Merge<BaseItemComponent, Partial<GetNoElementUIComponentType<OmitNoMethodsType<T>>>>,
    { xType: U }
>;

type Render<T> = (value: any, item: T, option: Columns[], table: Vue & { [K in keyof any]: any }) => string;
type MyElementUIComponentTypeWithBeforeRender<T extends ElementUIComponent, U extends XType, ELEvent> = Merge<
    Merge<MyFormItem, MyElementUIComponentType<T, U>>,
    {
        beforeRender?: Render<MyElementUIComponentTypeWithBeforeRender<T, U, ELEvent>>;
        events?: ELEvent;
        required?:
            | RequiredRule<MyElementUIComponentTypeWithBeforeRender<T, U, ELEvent>>
            | {
                  handle: RequiredRule<MyElementUIComponentTypeWithBeforeRender<T, U, ELEvent>>;
                  trigger?: 'blur' | 'change';
                  message?: string;
              };
    }
>;
export interface ELEvent {
    change: (v: any) => void;
    'visible-change': (show: boolean) => void;
    'remove-tag': (v: any) => void;
    clear: () => void;
    blur: (e: Event) => void;
    focus: (e: Event) => void;
    'expand-change': (v: any[]) => void;
    input: (v: string | number) => void;
}
export type MyInput = MyElementUIComponentTypeWithBeforeRender<
    ElInput,
    'input',
    Pick<ELEvent, 'change' | 'blur' | 'focus' | 'clear' | 'input'>
>;
export type MySelect = MyElementUIComponentTypeWithBeforeRender<
    ElSelect,
    'select',
    Pick<ELEvent, 'change' | 'blur' | 'clear' | 'focus' | 'remove-tag' | 'visible-change'>
> &
    StoreBase<MySelect>;

export type MyCheckbox = MyElementUIComponentTypeWithBeforeRender<ElCheckbox, 'checkbox', Pick<ELEvent, 'change'>>;
export type MyCheckboxGroup = MyElementUIComponentTypeWithBeforeRender<
    ElCheckboxGroup & { value: string[] },
    'checkboxGroup',
    Pick<ELEvent, 'change'>
> &
    StoreBase<MyCheckboxGroup>;

export type MyRadio = MyElementUIComponentTypeWithBeforeRender<ElRadio, 'radio', Pick<ELEvent, 'change'>>;
export type MyInputNumber = MyElementUIComponentTypeWithBeforeRender<
    ElInputNumber,
    'number',
    Pick<ELEvent, 'change' | 'blur' | 'focus'>
>;
export type MyCascader = MyElementUIComponentTypeWithBeforeRender<
    ElCascader,
    'cascader',
    Pick<ELEvent, 'change' | 'blur' | 'clear' | 'focus' | 'remove-tag' | 'visible-change' | 'expand-change'>
> &
    StoreBase<MyCascader>;
export type MyDatePicker = MyElementUIComponentTypeWithBeforeRender<
    ElDatePicker,
    'date',
    Pick<ELEvent, 'change' | 'blur' | 'focus'>
>;
export type MySwitch = MyElementUIComponentTypeWithBeforeRender<ElSwitch, 'switch', Pick<ELEvent, 'change'>>;
export type MyImgUpload = MyElementUIComponentTypeWithBeforeRender<
    ElUpload & {
        maxCount: number;
        value: string[];
        sortType?: ('zoom' | 'download' | 'remove' | 'edit')[];
    },
    'imgUpload',
    never
>;
export type MyText = Overwrite<
    Merge<
        BaseItemComponent,
        {
            value?: string;
            label: string;
        }
    >,
    { xType: 'text' }
> & {
    beforeRender?: Render<MyText>;
    required?:
        | RequiredRule<MyText>
        | {
              handle: RequiredRule<MyText>;
              trigger?: 'blur' | 'change';
              message?: string;
          };
};
