/* eslint-disable @typescript-eslint/no-unused-vars */
import store from '@/store';
import utils from '@/utils';
import { Route } from 'vue-router';

export default async function getUserInfo(to: Route, from: Route, next: (...arg: any) => void) {
    if (utils.isEmpty(store.getters['user/userInfo'])) {
        try {
            await store.dispatch('user/getUserInfo');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
}
