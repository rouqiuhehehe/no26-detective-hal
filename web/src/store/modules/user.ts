import auth from '@/api/auth';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

interface UserInfo {
    nickname: string;
    avatar: string;
    create_date: string;
    level: number;
    username: string;
}
interface State {
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
        try {
            const res = await auth.getUserInfo<State>();
            const userInfo = res.data;

            commit('CHANGE_USER_INFO', userInfo);
        } catch (error) {
            console.log(error);
        }
    }
};
export default {
    namespace: true,
    state,
    mutations,
    actions,
    getters
};
