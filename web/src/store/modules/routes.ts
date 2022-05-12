import routes from '@/api/routes';
import { AsideTree, formatRoutesTree, WebRoutesTree } from '@/types/routes';
import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { CreateElement } from 'vue/types/vue';

interface State {
    routesTree: Partial<WebRoutesTree>[];
    asideTree: Partial<AsideTree>[];
}
const state: State = {
    routesTree: [],
    asideTree: []
};

const getters: GetterTree<State, any> = {
    routesTree(state) {
        return state.routesTree;
    },
    asideTree(state) {
        return state.asideTree;
    }
};

const mutations: MutationTree<State> = {
    CHANGE_ROUTES_TREE(state, params) {
        state.routesTree = params;
    },
    CHANGE_ASIDE_TREE(state, params) {
        state.asideTree = params;
    }
};

function formatRoutes(params: Partial<WebRoutesTree>[]): formatRoutesTree[] {
    return params.map<formatRoutesTree>((v) => {
        const component =
            v.component === null
                ? { render: (e: CreateElement) => e('router-view') }
                : () => import(`@/views${v.component}`);
        let children: formatRoutesTree[] = [];
        if (v.children && v.children.length) {
            children = formatRoutes(v.children);
        }
        return {
            ...v,
            children,
            component
        };
    });
}
const actions: ActionTree<State, any> = {
    async getWebRoutes({ commit }) {
        const res = await routes.getRoutes<State>();
        const { routesTree, asideTree } = res.data;

        const route = formatRoutes(routesTree);
        commit('CHANGE_ROUTES_TREE', route);
        commit('CHANGE_ASIDE_TREE', asideTree);
    }
};
export default {
    namespace: true,
    state,
    mutations,
    actions,
    getters
};
