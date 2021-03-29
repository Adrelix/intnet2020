import Vue from 'vue';
import VueRouter from 'vue-router';
import LoginView from '../views/Login.vue';
import ProfileView from '../views/Profile.vue';
import RegisterView from '../views/Register.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: LoginView },
  { path: '/profile', component: ProfileView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

// Setup Authentication guard
router.beforeEach((to, from, next) => {
  console.log('To path', to.path);
  if (to.path === '/' || to.path === '/login' || to.path === '/register') {
    fetch('/api/checksession')
      .then((resp) => {
        if (resp.ok) next('/profile');
        else next();
      })
      .catch(console.error);
  } else if (to.path === '/profile') {
    fetch('/api/checksession')
      .then((resp) => {
        if (resp.ok) next();
        else next('/login');
      })
      .catch(console.error);
  } else next();
});

export default router;
