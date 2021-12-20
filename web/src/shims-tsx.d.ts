import MyUtils from '@/utils';
import Axios from 'axios';
import Vue, { VNode } from 'vue';
import VueRouter, { Route } from 'vue-router';
import { Store } from 'vuex';
import { AxiosRes } from './types/store';
declare global {
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
        $axios: typeof Axios;
        $router: VueRouter;
        $route: Route;
        $store: Store<unknown>;
        utils: typeof MyUtils;
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
    }
}
