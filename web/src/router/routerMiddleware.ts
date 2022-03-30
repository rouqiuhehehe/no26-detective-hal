import autoBind from '@/descriptors/Autobind';
import getRoutes from '@/middleware/getRoutes';
import getUserInfo from '@/middleware/getUserInfo';
import { NavigationGuardNext, Route } from 'vue-router';

@autoBind
export default class {
    private middleware = [getUserInfo, getRoutes];

    public async beforeEach(to: Route, from: Route, next: NavigationGuardNext<Vue>) {
        if (to.path === '/login' || to.path === '/404') next();
        else {
            await this.callMiddleware(this.middleware, to, from, next);
        }
    }

    public async afterEach(to: Route) {
        document.title = to.meta?.title ?? '26号探案馆';
    }

    private async callMiddleware(
        middleware: ((to: Route, from: Route, _next: (...arg: any[]) => void) => void)[],
        to: Route,
        from: Route,
        next: (...arg: any) => void
    ) {
        const stack = middleware.reverse();
        const _next = async (...args: any) => {
            // 有参数说明中间键，未执行完就终止了，或者中间键全部执行完退出
            if (args.length > 0 || stack.length === 0) {
                return next(...args);
            }

            const middleware = stack.pop();

            if (typeof middleware === 'function') {
                await middleware(to, from, _next);
            } else {
                throw Error(`Undefined middleware [${middleware}]`);
            }
        };

        await _next();
    }
}
