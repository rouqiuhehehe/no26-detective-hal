/* eslint-disable @typescript-eslint/ban-types */
import 'axios';
import Vue, { VNode } from 'vue';
import VueRouter, { Route } from 'vue-router';
import { Store } from 'vuex';
import { AxiosRes } from './types/store';

declare global {
    /**
     * 并集
     */
    type Intersection<T extends object, U extends object> = Pick<
        T,
        // 取出T中属于U的字段，和U中属于T的字段，取并集
        Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
    >;

    /**
     * 差集
     */
    type Diff<T extends object, U extends object> = Pick<
        T,
        // 取出T中不属于U的字段
        Exclude<keyof T, keyof U>
    >;

    /**
     * 将交叉类型合并
     */
    type Compute<T extends object> = T extends Function ? T : { [K in keyof T]: T[K] };
    /**
     * 合并接口
     */
    type Merge<T extends object, U extends object> = Compute<
        // 排除掉U中属于T的字段，和T组成交叉类型，然后合并成新接口
        T & Omit<U, keyof T>
    >;

    /**
     * 重写, U重写T
     */
    // 取出T,U的差集，再取出T,U的并集，联合成新接口
    type Overwrite<T extends object, U extends object, I = Diff<T, U> & Intersection<U, T>> = Pick<I, keyof I>;
    namespace JSX {
        // tslint:disable no-empty-interface
        interface Element extends VNode {}
        // tslint:disable no-empty-interface
        interface ElementClass extends Vue {}
        interface IntrinsicElements {
            [elem: string]: any;
        }
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $router: VueRouter;
        $route: Route;
        $store: Store<unknown>;
    }
}

declare module 'axios' {
    interface AxiosInstance {
        <T = any>(config: AxiosRequestConfig): AxiosRes<T>;
    }
    interface AxiosResponse<T> {
        status: number;
        success: boolean;
        data: T;
        pagination?: {
            total: number;
            page: number;
        };
    }
}
