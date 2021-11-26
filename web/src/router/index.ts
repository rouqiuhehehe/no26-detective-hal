import Vue from 'vue';
import VueRouter, { Route, RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const originPush = VueRouter.prototype.push;

VueRouter.prototype.push = function (location) {
    return (originPush.call(this, location) as unknown as Promise<Route>).catch((e) => {
        if (
            e.name !== 'NavigationDuplicated' &&
            !e.message.includes('Avoided redundant navigation to current location')
        ) {
            // But print any other errors to the console
            throw e;
        }
    }) as Promise<Route>;
};

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        meta: {
            title: '26号探案馆'
        },
        component: Home
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登陆'
        },
        component: () => import('../views/auth/Login.vue')
    }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

export default router;
