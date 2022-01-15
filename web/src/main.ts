import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.use(ElementUI);

if (process.env.NODE_ENV === 'production') {
    Vue.config.productionTip = false;
}

new Vue({
    router,
    store,
    render: (h) => h(App)
}).$mount('#app');
