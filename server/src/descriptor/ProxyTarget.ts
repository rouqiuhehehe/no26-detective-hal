/**
 * 代理class的prototype
 * 可以做代理拦截处理
 */
export default function <T extends Consturctor>(proxyHandler: ProxyHandler<Object>) {
    return (target: T) => {
        abstract class ProxyTarget extends target {
            protected constructor(...arg: any) {
                super(...arg);

                return new Proxy(this, proxyHandler);
            }
        }

        return ProxyTarget;
    };
}
