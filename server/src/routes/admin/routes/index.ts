import Db from '@src/bin/Db';
import redis from '@src/bin/redis';
import { Controller, Get } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Util from '@util';
import { Request, Response } from 'express';
import admin from '..';

const db = new Db();

interface WebRoutes {
    id: number;
    uid: string;
    pid: string | null;
    name: string;
    path: string;
    redirect: string | null;
    component: string;
    create_date: Date;
    update_date: Date;
    title: string;
    read_permission: string;
    write_permission: string;
    icon?: string;
    level: number;
}

type WebFormatRoutesTree = Omit<WebRoutes, 'write_permission' | 'read_permission'> & {
    meta: { readonly: boolean };
    children?: WebRoutesTree[];
};

type WebRoutesTree = Omit<WebRoutes, 'write_permission' | 'read_permission'> & {
    meta: { hidden: boolean; readonly: boolean; title: string };
    children?: WebRoutesTree[];
};

type AsideTree = Pick<WebRoutes, 'title' | 'path' | 'icon' | 'level'> & {
    children?: AsideTree[];
};

@Controller('/routes')
export default class extends admin {
    private excludesAsides = ['Home', 'Setting'];

    private excludesAsidesMap = new Map();

    private routeMap = new Set();

    @Middleware(['default'])
    @Get('/get-web-routes')
    public async getWebRoutes(req: Request, res: Response) {
        await this.getWebRoutesHandle(req, res);
    }

    // private homePageRender() {
    //     return 'this is student homepage, welcome!';
    // }

    private async getWebRoutesHandle(req: Request, res: Response) {
        const token = req.header('authorization')?.replace('Bearer ', '');

        await redis(async (client) => {
            const userWebRoutes = await client.get(`user:web-routes:${token}`);
            if (userWebRoutes) {
                return res.success(JSON.parse(userWebRoutes));
            }

            const { role } = await client.hGetAll(`user:${token}`);
            const webRoutes = await this.getDatabaseWebRoutes(req);
            const permissionList = (await this.getRolePermission(role?.split(','))).map((v) => v.n_permission_id);

            const permissionHandleRoutes = this.permissionHandle(webRoutes, permissionList);
            this.excludesAsidesMap.clear();
            this.routeMap.clear();
            const routesTree = this.formatRoutes(Util.deepClone(permissionHandleRoutes), null);
            const asideTree = this.formatAside(Util.deepClone(permissionHandleRoutes), null);

            const routesAndAsideTree = {
                routesTree,
                asideTree
            };
            await client.set(`user:web-routes:${token}`, JSON.stringify(routesAndAsideTree));
            await client.expire(`user:web-routes:${token}`, baseConfig.redis.WEB_ROUTES_EXPIRE);
            res.success({
                routesTree,
                asideTree
            });
        });
    }

    private permissionHandle(routes: WebRoutes[], permissionList: string[]) {
        return routes.reduce<WebFormatRoutesTree[]>((a, v) => {
            let readonly = false;
            const { read_permission, write_permission } = v;
            if (read_permission) {
                if (!permissionList.includes(read_permission)) {
                    // 没有可读权限，不添加路由
                    return a;
                }
            }
            if (write_permission) {
                if (!permissionList.includes(write_permission)) {
                    // 没有可写权限，添加readonly
                    readonly = true;
                }
            }
            Reflect.deleteProperty(v, 'read_permission');
            Reflect.deleteProperty(v, 'write_permission');
            a.push({
                ...v,
                meta: {
                    readonly
                }
            });
            return a;
        }, []);
    }

    private formatRoutes(routes: WebRoutesTree[], pid: string | null) {
        const routesTree: WebRoutesTree[] = [];
        let i = 0;

        while (i < routes.length) {
            const v = routes[i];

            if (!v.meta.hidden) {
                if (v.pid === pid) {
                    routes.splice(i--, 1);
                    const children = this.formatRoutes(routes, v.uid);

                    v.meta.title = v.title;
                    if (!Util.isEmpty(children)) {
                        v.children = children;
                    }
                    if (!v.redirect) {
                        Reflect.deleteProperty(v, 'redirect');
                    }
                    Reflect.deleteProperty(v, 'update_date');
                    Reflect.deleteProperty(v, 'title');
                    Reflect.deleteProperty(v, 'create_date');
                    Reflect.deleteProperty(v, 'uid');
                    Reflect.deleteProperty(v, 'pid');
                    Reflect.deleteProperty(v, 'id');
                    Reflect.deleteProperty(v, 'icon');
                    routesTree.push(v);
                }
            }
            i++;
        }
        return routesTree;
    }

    private formatAside(routes: WebRoutesTree[], pid: string | null) {
        const asideTree: AsideTree[] = [];

        routes.reduce((a, v) => {
            if (!v.meta.hidden && !this.routeMap.has(v.uid)) {
                if (this.excludesAsides.includes(v.name)) {
                    this.excludesAsidesMap.set(v.uid, v);
                } else {
                    if (v.pid) {
                        const parent = this.excludesAsidesMap.get(v.pid);
                        if (parent) {
                            v.pid = parent.pid;
                        }
                    }
                    if (v.pid === pid) {
                        this.routeMap.add(v.uid);
                        const children = this.formatAside(routes, v.uid);

                        const obj: AsideTree = {
                            title: v.title,
                            path: v.path,
                            level: v.level
                        };

                        if (!Util.isEmpty(children)) {
                            obj.children = children;
                        }

                        if (v.icon) {
                            obj.icon = v.icon;
                        }
                        a.push(obj);
                    }
                }
            }
            return a;
        }, asideTree);

        return asideTree
            .sort((a, b) => a.level - b.level)
            .map((v) => {
                Reflect.deleteProperty(v, 'level');
                return v;
            });
    }

    private async getDatabaseWebRoutes(req: Request) {
        const sql = 'select * from web_routes';
        return await db.asyncQueryBySock<WebRoutes[]>(req, sql);
    }

    private async getRolePermission(roleId: string[] = []) {
        const sql = `SELECT DISTINCT n_permission_id FROM n_permission_relation WHERE n_role_id in (${roleId
            .map((v) => `'${v}'`)
            .toString()})`;
        return await db.asyncQuery<{ n_permission_id: string }[]>(sql);
    }
}
