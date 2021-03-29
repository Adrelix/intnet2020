import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import io from 'socket.io-client';
import App from './App.vue';
import router from './router';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

(async () => {
  // add name
  new Vue({
    router,
    render: h => h(App),
    data: {
      socket: io().connect(),
    },
  }).$mount('#app');
})();
