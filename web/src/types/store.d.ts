import { AxiosRequestConfig } from 'axios';

export interface Staties {
    fromName: string;
    toName: string;
    success: boolean | undefined;
    path: string;
}

export interface Check {
    (rule: { field: string; fullField: string; type: string }, value: string, callback: (sub?: Error) => void): void;
}

export interface elRuleObject {
    required?: boolean;
    message?: string;
    type?: string;
    trigger: string;
    validator?: Check;
}

// BooksList Types
export interface BooksListParams {
    test?: any;
    id?: number;
    booksName?: string;
    anthor?: string;
    issueTime?: Date | Date[] | string;
    sold?: number | undefined;
    inventory?: number | undefined;
    coverImage?: string;
    addUser?: string;
    addUserId?: number;
    addTime?: string | Date;
    updateUser?: string;
    updateTime?: string | Date;
    updateUserId?: number;
    type?: string;
}

export interface BookSearchParams extends BooksListParams {
    startTime?: string;
    type?: number[];
    endTime?: string;
    limit?: number;
    offset?: number;
}

export interface BookAddParams extends BooksListParams {
    id: number | undefined;
    booksName: string;
    anthor: string;
    type: number[];
}

// dictionary
declare namespace Dictionary {
    interface Button {
        xType: 'delete' | 'edit' | 'add' | 'click';
        header: string; // 按钮名
        store?: string;
        loadStore?: true | AxiosRequestConfig; // 编辑取值接口，可以是url，也可以为true，为true时从当前table拿数据
        message?: string;
        title?: string;
        click?: <T>(a: T) => void;
        option?: BtnConfig[];
    }

    interface BtnConfig {
        header?: string;
        xType: 'text' | 'label' | 'select' | 'image' | 'timePick' | 'radio' | 'component' | 'date';
        disabledTime?: (time: Date) => boolean;
        hasShortcutOptions?: boolean;
        labelWidth?: number;
        dataIndex: string;
        placeHolder?: string | ((item: MyFormConfig) => string);
        box?: number;
        min?: number; // test最小长度
        max?: number; // test最大长度
        value?: string | number | [];
        required?:
            | boolean
            | 'number'
            | '!number'
            | 'email'
            | '!email'
            | 'phone'
            | '!phone'
            | 'Idcard'
            | '!Idcard'
            | ((v: string) => string | boolean); // 自定义校验，加感叹号时为必填，也可传入参数，return错误信息
        reqMessage?: string; // 当required为true或者string时，可以自定义错误提示
        reqTrigger?: 'blur' | 'input' | 'change'; // 触发校验的事件
        multiple?: boolean;
        render?: (
            h: string | number | any[] | Record<string, unknown> | Date | boolean,
            row: Record<string, unknown>
        ) => string | number;
        input?: (value: string | number, lineData: Record<string, unknown>) => void; // oninput
        change?: (
            value: string | number | boolean | string[] | number[] | boolean[],
            lineData: Record<string, unknown>
        ) => void; // onchange
        valueForMatter?: <T>(h: T) => T | unknown; // 格式化提交参数
        component?: unknown;
        timeIndex?: {
            // 配置该项，datePick选择的参数将以'startTime'的值和'endTime'的值添加到表单提交
            startTime: string;
            endTime: string;
        };
        index?: {
            // 当store接口为url时，可以配置该项重定向select的key和value
            key: string;
            value: string;
        };
        store?:
            | {
                  key: number | string;
                  value: string | number;
              }[]
            | string;
    }

    export interface MyFormConfig {
        class?: string;
        labelWidth?: string;
        labelPosition?: string;
        gutter?: number;
        option: BtnConfig[] | Record<string, unknown>;
        store?: string;
    }

    export interface MyTableConfig {
        option: {
            dataIndex: string; // table字段名
            header: string; // table列名
            width?: number;
            show?: boolean; // 字段是否显示
            fixed?: string;
            xType?: 'text' | 'label' | 'select' | 'image' | 'timePick' | 'radio' | 'component'; //
            render?: <T extends string | number>(a: T) => string | number; // 支持html
            button?: Button[]; // table操作栏配置
            click?: <T extends string | number>(a: T) => void;
        }[];
        onBeforeSearch?: (h: Record<string, unknown>) => Record<string, unknown> | false; // 搜索前置钩子
        maxHeight?: number;
        search?: MyFormConfig; // 搜索栏配置
        button?: Button[]; // button操作配置
        store: string; // table数据接口地址
        storeData?: Record<string, unknown>; // table数据接口自定义参数
        hasNotPage?: boolean; // 无分页时设置为true
        class?: string; // table class类名
    }
}

declare namespace myDialog {
    export interface dialogMyForm {
        store?: string;
        loadStore?: true | AxiosRequestConfig;
        message?: string;
        title?: string;
        click?: <T>(a: T) => void;
        beforeClose?: <T>(a: T) => boolean;
        beforeCancal?: <T>(a: T) => boolean;
        class?: string;
        labelWidth?: string;
        labelPosition?: string;
        gutter?: number;
        option?: BtnConfig[];
    }
}

// app return data format
export declare interface appReturnData<T> {
    status: number;
    success: boolean;
    data: T;
}

export declare interface appReturnErrorData<T> {
    status: number;
    success: false;
    message: string;
}
