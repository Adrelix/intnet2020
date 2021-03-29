<template>
  <div id="app">
    <div id='navbar'>
      <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand v-on:click="redirect('/')">Goggle Cheap</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav >
            <b-nav-item href="#" v-on:click="gtr()" v-if="cil() === 'false'">Register</b-nav-item>
          </b-navbar-nav>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto" v-if="cil() === 'true'">
              <b-dropdown-item href="#" v-on:click="logout()">Sign Out</b-dropdown-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: io('https://localhost:1337'),
      isAuth: false,
    };
  },
  methods: {
    redirect(target) {
      this.$router.push(target);
    },

    // logs the user out
    logout() {
      fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.isAuth = false;
      this.$router.push('login');
    },
    // redirect the user to register page
    gtr() {
      this.$router.push('register');
    },

    // checked if user is currently in a signed in mode, might not be necessary anymore
    cil() {
      if (this.isAuth === true) { return 'true'; }
      return 'false';
    },
  },
  mounted() {
    this.$root.$on('logout', () => {
      this.$router.push('login');
      this.isAuth = false;
    });
    this.$root.$on('isauth', (data) => {
      this.isAuth = data.isAuth;
    });
    console.log('Mounted in App');
  },
  created() {
    fetch('/api/checksession')
      .then((resp) => {
        if (resp.ok) this.isAuth = true;
        else this.isAuth = false;
      })
      .catch(console.error);
  },
};
</script>
