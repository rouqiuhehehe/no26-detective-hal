import myAxios from '@/utils/myAxios';
import { MyUtils } from '@/utils/utils';
import Vue, { VNode } from 'vue';
import VueRouter, { Route } from 'vue-router';
import { Store } from 'vuex';
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
        $axios: typeof myAxios;
        $router: VueRouter;
        $route: Route;
        $store: Store<unknown>;
        utils: MyUtils;
    }
}
