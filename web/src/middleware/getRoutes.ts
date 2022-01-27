/* eslint-disable @typescript-eslint/no-unused-vars */
import router from '@/router';
import store from '@/store';
import utils from '@/utils';
import { Route, RouteConfig } from 'vue-router';

export default async function getUserInfo(to: Route, from: Route, next: (...arg: any) => void) {
    if (utils.isEmpty(store.getters['routes/routesTree']) || utils.isEmpty(store.getters['routes/asideTree'])) {
        try {
            await addRoutes();

            next({ ...to, replace: true });
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
}

export async function addRoutes() {
    await store.dispatch('routes/getWebRoutes');

    store.getters['routes/routesTree'].forEach((v: RouteConfig) => {
        router.addRoute(v);
    });

    router.addRoute({
        path: '*',
        redirect: '/404'
    });
}
