import Vue from 'vue';
import Vuex, { ModuleTree } from 'vuex';

Vue.use(Vuex);

const controller = require.context('./modules', true, /\.ts$/);

const modules = controller.keys().reduce((a, v) => {
    const module = controller(v).default ?? controller(v);
    const moduleName = v.match(/(?<=\/).*(?=\.)/);

    if (moduleName) {
        module.namespaced = true;
        a[moduleName[0]] = module;
    }

    return a;
}, {} as ModuleTree<any>);

export default new Vuex.Store({
    modules
});
