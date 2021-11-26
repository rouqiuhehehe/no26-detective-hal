import axios from '@/middleware/axios';
import getUserInfo from '@/middleware/getUserInfo';
import myUtils from '@/utils/utils';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.use(ElementUI);

Vue.config.productionTip = false;
Vue.prototype.utils = myUtils;
Vue.prototype.$axios = axios;

router.beforeEach((to, from, next) => {
    if (to.meta?.title) {
        document.title = to.meta.title;
    }
    if (sessionStorage.getItem('token')) {
        getUserInfo(to, from);
        next();
    } else {
        if (to.path === '/login') next();
        else {
            ElementUI.MessageBox.alert('你还没有登陆，请先登录', {
                title: '提示',
                type: 'error'
            }).then(() => {
                next('/login');
            });
        }
    }
});

new Vue({
    router,
    store,
    render: (h) => h(App)
}).$mount('#app');
