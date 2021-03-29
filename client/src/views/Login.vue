<template>
  <div class="text-box col-md-4 col-md-offset-4" style="margin: 0 auto; text-align: center">
    <h1>Login</h1>
    <form v-on:submit.prevent="login()">
      <input class="form-control" type="text" v-model="username" required autofocus
      placeholder="Username"/>
      <input class="form-control" type="password" v-model="password" required autofocus
      placeholder="Password"/>
      <div style="padding: 5px">
        <input class="btn btn-info" type="submit" value="Login" />
      </div>
    </form>
    <b-button variant="outline-primary" v-on:click="register()">Register new user</b-button>
    <br>
    <span>{{errMsg}}</span>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  components: {},
  data: () => ({
    username: '',
    password: '',
    errMsg: '',

  }),
  methods: {
    register() {
      this.$router.push({
        path: '/register',
      });
    },

    login() {
      fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      })
        .then((resp) => {
          if (resp.ok) return resp;
          this.$router.push({
            path: 'login',
          });
          throw new Error(resp.text);
        })
        .then(() => {
          console.log('Login this.username', this.username);
          this.$root.$emit('isauth', { isAuth: true });
          this.$router.push({
            path: '/profile',
          });
        })
        .catch((error) => {
          console.error('Authentication failed unexpectedly');
          this.password = '';
          this.username = '';
          this.errMsg = 'Wrong username or password';

          throw error;
        });
    },
  },
};
</script>
