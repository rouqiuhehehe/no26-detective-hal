import { ElCascader } from 'element-ui/types/cascader';
import { ElCheckbox } from 'element-ui/types/checkbox';
import { ElCheckboxGroup } from 'element-ui/types/checkbox-group';
import { ElementUIComponent, ElementUIComponentSize, ElementUIHorizontalAlignment } from 'element-ui/types/component';
import { ElDatePicker } from 'element-ui/types/date-picker';
import { FormItemLabelPosition } from 'element-ui/types/form';
import { ElInput } from 'element-ui/types/input';
import { ElInputNumber } from 'element-ui/types/input-number';
import { ElRadio } from 'element-ui/types/radio';
import { ElSelect } from 'element-ui/types/select';
import { ElSwitch } from 'element-ui/types/switch';
import { ElUpload } from 'element-ui/types/upload';
import Vue, { Component, CreateElement, VNode } from 'vue';
import { AxiosError } from './store';
import {
    cellCallbackParams,
    DefaultSortOptions,
    rowCallbackParams,
    SummaryMethodParams,
    treeNode
} from 'element-ui/types/table';
import { TooltipEffect } from 'element-ui/types/tooltip';
import { AxiosResponse } from 'axios';
import { PopoverPlacement } from 'element-ui/types/popover';
import {
    RenderHeaderData,
    SortOrders,
    TableColumnFilter,
    TableColumnFixedType,
    TableColumnType
} from 'element-ui/types/table-column';
import { ElMessageBoxOptions } from 'element-ui/types/message-box';

/* eslint-disable @typescript-eslint/ban-types */
/** Table Component */
export interface MyTable {
    search?: DefaultForm;
    store: ColumnsStore;

    columns: MyTableColumns[];

    operation: MyTableColumnsOperation;

    /** Table's height. By default it has an auto height. If its value is a number, the height is measured in pixels; if its value is a string, the height is affected by external styles */
    height?: string | number;

    /** Table's max-height. The height of the table starts from auto until it reaches the maxHeight limit. The maxHeight is measured in pixels, same as height */
    maxHeight?: string | number;

    /** Whether table is striped */
    stripe?: boolean;

    /** Whether table has vertical border */
    border?: boolean;

    /** Whether width of column automatically fits its container */
    fit?: boolean;

    /** Whether table header is visible */
    showHeader?: boolean;

    /** Whether current row is highlighted */
    highlightCurrentRow?: boolean;

    /** Key of current row, a set only prop */
    currentRowKey?: string | number;

    /** Whether to lazy load tree structure data, used with load attribute */
    lazy?: boolean;

    /** Horizontal indentation of nodes in adjacent levels in pixels */
    indent?: number;

    /** Function that returns custom class names for a row, or a string assigning class names for every row */
    rowClassName?: string | ((param: rowCallbackParams) => string);

    /** Function that returns custom style for a row, or an object assigning custom style for every row */
    rowStyle?: object | ((param: rowCallbackParams) => object);

    /** Function that returns custom class names for a cell, or a string assigning class names for every cell */
    cellClassName?: string | ((param: cellCallbackParams) => string);

    /** Function that returns custom style for a cell, or an object assigning custom style for every cell */
    cellStyle?: object | ((param: cellCallbackParams) => object);

    /** Function that returns custom class names for a row in table header, or a string assigning class names for every row in table header */
    headerRowClassName?: string | ((param: rowCallbackParams) => string);

    /** Function that returns custom style for a row in table header, or an object assigning custom style for every row in table header */
    headerRowStyle?: object | ((param: rowCallbackParams) => object);

    /** Function that returns custom class names for a cell in table header, or a string assigning class names for every cell in table header */
    headerCellClassName?: string | ((param: cellCallbackParams) => string);

    /** Function that returns custom style for a cell in table header, or an object assigning custom style for every cell in table header */
    headerCellStyle?: object | ((param: cellCallbackParams) => object);

    /** Key of row data, used for optimizing rendering. Required if reserve-selection is on */
    rowKey?: (row: object) => any;

    /** Displayed text when data is empty. You can customize this area with `slot="empty"` */
    emptyText?: String;

    /** Whether expand all rows by default. Only works when the table has a column `type="expand"` */
    defaultExpandAll?: Boolean;

    /** Set expanded rows by this prop. Prop's value is the keys of expand rows, you should set row-key before using this prop */
    expandRowKeys?: any[];

    /** Set the default sort column and order */
    defaultSort?: DefaultSortOptions;

    /** Tooltip effect property */
    tooltipEffect?: TooltipEffect;

    /** Whether to display a summary row */
    showSummary?: boolean;

    /** Displayed text for the first column of summary row */
    sumText?: string;

    /** Custom summary method */
    summaryMethod?: (param: SummaryMethodParams) => any[];

    /** Controls the behavior of master checkbox in multi-select tables when only some rows are selected */
    selectOnIndeterminate?: boolean;

    /** method for lazy load subtree data */
    load?: (row: object, treeNode: treeNode, resolve: Function) => void;
}

export interface MyTableColumns {
    beforeRender?: (
        v: any,
        row: Record<string, any>,
        options: MyTableColumns,
        tableOptions: MyTable
    ) => Record<string, any>;

    component?: ComponentBase<any, MyTableColumns, MyTable>;

    /** Type of the column. If set to `selection`, the column will display checkbox. If set to `index`, the column will display index of the row (staring from 1). If set to `expand`, the column will display expand icon. */
    type?: TableColumnType;

    /** Column label */
    label: string;

    /** Column's key. If you need to use the filter-change event, you need this attribute to identify which column is being filtered */
    columnKey?: string;

    /** Field name. You can also use its alias: property */
    dataIndex: string;

    /** Column width */
    width?: string;

    /** Column minimum width. Columns with `width` has a fixed width, while columns with `min-width` has a width that is distributed in proportion */
    minWidth?: string;

    /** Whether column is fixed at left/right. Will be fixed at left if `true` */
    fixed?: boolean | TableColumnFixedType;

    /** Render function for table header of this column */
    renderHeader?: (h: CreateElement, data: RenderHeaderData) => VNode | string;

    /** Whether column can be sorted */
    sortable?: boolean | 'custom';

    /** Sorting method. Works when `sortable` is `true` */
    sortMethod?: (a: any, b: any) => number;

    /** The order of the sorting strategies used when sorting the data. Works when `sortable` is `true`. */
    sortOrders?: SortOrders[];

    /** Whether column width can be resized. Works when border of `el-table` is `true` */
    resizable?: boolean;

    /** Whether to hide extra content and show them in a tooltip when hovering on the cell */
    showOverflowTooltip?: boolean;

    /** Alignment */
    align?: ElementUIHorizontalAlignment;

    /** Alignment of the table header. If omitted, the value of the `align` attribute will be applied */
    headerAlign?: ElementUIHorizontalAlignment;

    /** Class name of cells in the column */
    className?: string;

    /** Class name of the label of this column */
    labelClassName?: string;

    /** Function that determines if a certain row can be selected, works when `type` is `'selection'` */
    selectable?: (row: object, index: number) => boolean;

    /** Whether to reserve selection after data refreshing, works when `type` is `'selection'` */
    reserveSelection?: boolean;

    /** An array of data filtering options */
    filters?: TableColumnFilter[];

    /** Placement for the filter dropdown */
    filterPlacement?: PopoverPlacement;

    /** Whether data filtering supports multiple options */
    filterMultiple?: Boolean;

    /** Data filtering method. If `filter-multiple` is on, this method will be called multiple times for each row, and a row will display if one of the calls returns `true` */
    filterMethod?: (value: any, row: object) => boolean;

    /** Filter value for selected data, might be useful when table header is rendered with `render-header` */
    filteredValue?: TableColumnFilter[];
}

export type MyTableColumnsOperation = Omit<
    Merge<
        MyTableColumns,
        {
            button: MyDialog[];
        }
    >,
    'label'
>;

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
    form?: MyDialogForm[];
}

export type FormType = 'edit' | 'del' | 'view';

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
    | MyImgUpload
    | MyComponent;

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

    beforeRender?: (formData: any, options: MyForm) => Record<string, any>;
}

export interface EditForm extends MyForm {
    type: 'edit';
    /**
     * view接口
     */
    viewStore: FormStore<any>;

    viewParams?: (
        tableColumnsData?: Record<string, any>,
        table?: Vue & { [K in keyof any]: any }
    ) => { [K in keyof A]: A[k] } | Record<string, any>;

    beforeCommit?: (
        this: Vue,
        formData: Record<string, any>,
        options: EditForm,
        table: Vue & { [K in keyof any]: any }
    ) => Record<string, any> | boolean;

    afterCommit?: (
        this: Vue,
        res: T | AxiosError<any>,
        options: EditForm,
        table: Vue & { [K in keyof any]: any }
    ) => void;
}

export interface ViewForm extends MyForm {
    type: 'view';
    /**
     * view接口
     */
    viewStore: FormStore<any>;

    viewParams?: (
        tableColumnsData?: Record<string, any>,
        table?: Vue & { [K in keyof any]: any }
    ) => { [K in keyof A]: A[k] } | Record<string, any>;
}

export interface DelForm {
    type: 'del';
    store: FormStore;
    confirm: ElMessageBoxOptions;
    beforeCommit?: (
        this: Vue,
        tableColumnData?: Record<string, any>,
        options: DelForm,
        table?: Vue & { [K in keyof any]: any }
    ) => Record<string, any> | boolean;

    afterCommit?: (
        this: Vue,
        res: T | AxiosError<any>,
        options: DelForm,
        table?: Vue & { [K in keyof any]: any }
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
    ) => Record<string, any> | boolean;
}

export type MyDialogForm = EditForm | DefaultForm | ViewForm | DelForm;

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
    | 'imgUpload'
    | 'component';

export interface ComponentBase<T = any, U = ComponentBase, A = any> {
    component:
        | Component
        | ((value: T, option: U) => Component)
        | ((value: T, row: Record<string, any>, option: U, options?: A) => Component);
    bind:
        | Record<string, any>
        | ((value: T, option: U) => Record<string, any>)
        | ((value: T, row: Record<string, any>, option: U, options?: A) => Component);
    events:
        | Record<string, any>
        | ((value: T, option: U) => Record<string, any>)
        | ((value: T, row: Record<string, any>, option: U, options?: A) => Component);
}
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

export type MyComponent = Overwrite<Merge<BaseItemComponent, ComponentBase<any, MyComponent>>, { xType: 'component' }>;
