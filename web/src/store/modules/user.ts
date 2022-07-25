import userOperation from '@/api/auth/user-operation';
import { UserInfo } from '@/api/setting';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

export interface State {
    userInfo: Partial<UserInfo>;
}

const state: State = {
    userInfo: {}
};

const getters: GetterTree<State, any> = {
    userInfo(state) {
        return state.userInfo;
    }
};

const mutations: MutationTree<State> = {
    CHANGE_USER_INFO(state, params) {
        state.userInfo = params;
    }
};

const actions: ActionTree<State, any> = {
    async getUserInfo({ commit }) {
        const res = await userOperation.getUserInfo<State>();
        const userInfo = res.data;

        commit('CHANGE_USER_INFO', userInfo);
    }
};
export default {
    namespace: true,
    state,
    mutations,
    actions,
    getters
};
