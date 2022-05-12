import Vue from 'vue';

const controller = require.context('./', true, /\.ts$/);

controller.keys().forEach((v) => {
    const name = v.match(/(?<=\/).*(?=\.)/);
    if (name && name[0] !== 'index') {
        const module = controller(v).default;
        Vue.directive(name[0], module);
    }
});
