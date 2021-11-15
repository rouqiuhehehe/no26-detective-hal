import myAxios from '@/utils/myAxios';
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
Vue.prototype.$axios = myAxios;

router.beforeEach((to, from, next) => {
    if (sessionStorage.getItem('isLogin')) {
        next();
    } else {
        if (to.path === '/login') next();
        else {
            ElementUI.MessageBox.alert('You have not logged in yet, please log in first').then(() => {
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
