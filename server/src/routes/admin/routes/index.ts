import Db from '@src/bin/Db';
import redis from '@src/bin/redis';
import { Permission } from '@src/config/permission';
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
    read_permission: Permission;
    write_permission: Permission;
    icon?: string;
}

type WebFormatRoutesTree = Omit<WebRoutes, 'write_permission' | 'read_permission'> & {
    meta: { hidden: boolean; readonly: boolean };
    children?: WebRoutesTree[];
};

type WebRoutesTree = Omit<WebRoutes, 'write_permission' | 'read_permission'> & {
    meta: { hidden: boolean; readonly: boolean; title: string };
    children?: WebRoutesTree[];
};

type AsideTree = Pick<WebRoutes, 'title' | 'path' | 'icon'> & {
    children?: AsideTree[];
};

@Controller('/routes')
export default class extends admin {
    private excludesAsides = ['Home', 'Setting'];

    private excludesAsidesMap = new Map();

    @Middleware(['default'])
    @Get('/get-web-routes')
    public getWebRoutes(req: Request, res: Response) {
        this.getWebRoutesHandle(req, res);
    }

    // private homePageRender() {
    //     return 'this is student homepage, welcome!';
    // }

    private async getWebRoutesHandle(req: Request, res: Response) {
        const token = req.header('authorization')?.replace('Bearer ', '');

        await redis(async (client) => {
            const { permission } = await client.hGetAll('user:' + token);

            const webRoutes = await this.getDatabaseWebRoutes(req);

            const permissionHandleRoutes = this.permissionHandle(webRoutes, +permission as Permission);

            const routesTree = this.formatRoutes(Util.deepClone(permissionHandleRoutes), null);
            const asideTree = this.formatAside(Util.deepClone(permissionHandleRoutes), null);

            res.success({
                routesTree,
                asideTree
            });
        });
    }

    private permissionHandle(routes: WebRoutes[], permission: Permission) {
        return routes.map<WebFormatRoutesTree>((v) => {
            let hidden = false;
            let readonly = false;
            if ((permission & v.write_permission) === v.write_permission) {
                // 可读写权限
                hidden = false;
                readonly = false;
            } else if ((permission & v.read_permission) === v.read_permission) {
                // 可读权限
                hidden = false;
                readonly = true;
            } else {
                // 不可读写
                hidden = true;
                readonly = true;
            }

            Reflect.deleteProperty(v, 'read_permission');
            Reflect.deleteProperty(v, 'write_permission');
            const obj = {
                ...v,
                meta: {
                    hidden,
                    readonly
                }
            };
            return obj;
        });
    }

    private formatRoutes(routes: WebRoutesTree[], pid: string | null) {
        const routesTree: WebRoutesTree[] = [];
        let i = 0;

        while (i < routes.length) {
            const v = routes[i];

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
            i++;
        }
        return routesTree;
    }

    private formatAside(routes: WebRoutesTree[], pid: string | null) {
        const asideTree: AsideTree[] = [];

        routes.reduce((a, v, i) => {
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
                    routes.splice(i, 1);
                    const children = this.formatAside(routes, v.uid);

                    const obj: AsideTree = {
                        title: v.title,
                        path: v.path
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
            return a;
        }, asideTree);

        return asideTree;
    }

    private async getDatabaseWebRoutes(req: Request) {
        const sql = 'select * from web_routes';
        return await db.asyncQueryBySock<WebRoutes[]>(req, sql);
    }
}
