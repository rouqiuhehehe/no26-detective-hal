import { Component } from 'vue';

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
    icon?: string;
}

export type WebRoutesTree = WebRoutes & {
    meta: { hidden: boolean; readonly: boolean };
    children?: WebRoutesTree[];
};

export type AsideTree = Pick<WebRoutes, 'title' | 'path' | 'icon'> & {
    children?: AsideTree[];
};

export type formatRoutesTree = Partial<Omit<WebRoutes, 'component'>> & {
    meta?: { hidden: boolean; readonly: boolean };
    children?: formatRoutesTree[];
    component?: (() => Promise<Component>) | Component;
};
