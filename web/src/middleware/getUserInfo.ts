/* eslint-disable @typescript-eslint/no-unused-vars */
import store from '@/store';
import utils from '@/utils/utils';
import { Route } from 'vue-router';

export default function getUserInfo(to: Route, from: Route) {
    if (utils.isEmpty(store.getters['user/userInfo'])) {
        store.dispatch('user/getUserInfo');
    }
}
