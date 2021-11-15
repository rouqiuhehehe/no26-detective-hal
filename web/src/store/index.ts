import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userInfo: {
            userId: '',
            userName: '',
            level: 0
        }
        // menuNav: null
    },
    mutations: {
        changeLoginState(state, params) {
            state.userInfo.userId = params.userId;
            state.userInfo.userName = params.userName;
            state.userInfo.level = params.level;
        },
        initLoginState(state) {
            state.userInfo.userId = '';
            state.userInfo.userName = '';
            state.userInfo.level = 0;
        }
    },
    actions: {},
    modules: {}
});
