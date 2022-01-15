import Vue from 'vue';
import VueRouter, { RawLocation, Route, RouteConfig } from 'vue-router';
import RouterMiddleware from './routerMiddleware';

Vue.use(VueRouter);

const originPush = VueRouter.prototype.push;

VueRouter.prototype.push = function (location: RawLocation) {
    return (originPush.call(this, location) as unknown as Promise<Route>).catch(() => {
        //
    }) as Promise<Route>;
};

const routes: Array<RouteConfig> = [
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登陆'
        },
        component: () => import('../views/auth/Login.vue')
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('../views/notFound/index.vue')
    }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

const routerMiddleware = new RouterMiddleware();

router.beforeEach(routerMiddleware.beforeEach);
router.afterEach(routerMiddleware.afterEach);

export default router;
