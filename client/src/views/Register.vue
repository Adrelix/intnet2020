<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Register new user</h1>
    <form v-on:submit.prevent="register()">
      <input class="form-control" type="text" placeholder="Username"
      v-model="username" required autofocus />
      <input class="form-control" type="password" placeholder="Password"
      v-model="password" required autofocus />
      <input class="form-control" type="password" placeholder="Verify password"
      v-model="repPassword" required autofocus />
      <input class="form-control" type="text" placeholder="Email"
      v-model="email" required autofocus />
      <div style="padding: 5px">
        <input class="btn btn-success" type="submit" value="Register" />
      </div>
    </form>
        <b-button class="btn btn-light" v-on:click="backToLogin()">Back</b-button>

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
    repPassword: '',
    errMsg: '',

  }),
  methods: {
    backToLogin() {
      this.$router.push({
        path: 'login',
      });
    },

    register() {
      if (this.password !== this.repPassword) {
        this.errMsg = 'Passwords doesn\'t match';
        throw new Error('Error pws dont match');
      } else if (this.username.length < 4 || this.password.length < 4) {
        this.errMsg = 'Too short username or pw';
        throw new Error('Error reg input');
      } else {
        fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
            repPassword: this.repPassword,
            email: this.email,
          }),
        })
          .then((resp) => {
            if (resp.ok) {
              this.$router.push({
                path: 'login',
              });
            } else {
              throw new Error(resp.text);
            }
          })
          .catch((error) => {
            console.error('Authentication failed unexpectedly');
            this.errMsg = `Username: ${this.username} already exist`;
            throw error;
          });
      }
    },
  },
};
</script>
