<template>
    <div class="box">
        <div class="addTodo">
          <div v-if="!showlist">
            <div class="center-input">
              <div>
                <input type = "text" class="no-border" v-model="title"
                required autofocus placeholder="Title"/>
              </div>
              <br>
              <input type = "text" class="no-border" v-model="desc"
              required autofocus placeholder="Make a note..."/>
              <div style="padding: 5px">
                <b-button variant="outline-primary"
                @click="addTodo()">Done</b-button>
              </div>
            </div>
          </div>
          <div id="listdiv" v-if="showlist">
            <AddList></AddList>
        </div>
        </div>
        <div align="right">
          <b-button-group>
            <b-button @click="switchAdd()" :disabled="!showlist">add todo</b-button>
            <b-button @click="switchAdd()" :disabled="showlist">add list</b-button>
          </b-button-group>
          <br>
          <b-alert v-model="showAlert" variant="danger" dismissible>
            You can't add a todo with empty title or description! Please try again.
          </b-alert>
        </div>
    </div>
</template>

<script>
import AddList from './AddList.vue';

export default {
  data() {
    return {
      showlist: false,
      title: '',
      desc: '',
      showAlert: false,
    };
  },
  components: {
    AddList,
  },
  methods: {
    switchAdd() {
      this.showlist = !this.showlist;
    },
    addTodo() {
      if (this.title === '' || this.desc === '') {
        console.log('Should create todo');
        // this.$bvToast.toast('You can\'t add a todo with
        // empty title or description! Please try again.', {
        //   title: 'Error',
        //   toaster: 'b-toaster-top-center',
        //   solid: true,
        //   appendToast: true,
        // });
        this.showAlert = true;
      } else {
        this.$root.$emit('addTodo', { title: this.title, desc: this.desc });
        this.title = '';
        this.desc = '';
      }
    },
  },
};
</script>

<style scoped>
  .box {
    margin: 0 auto;
    width: 25%;
  }
  .addTodo {
    border-style: solid;
    border-width: 1px;
    box-shadow: 0 0 5px #888888;
    border-radius: 5px;
    border-color: grey;
  }
  .no-border {
    border: 0;
    box-shadow:none;
    border-bottom: 1px solid darkgray;
    width: 95%;
    text-align: center;
  }

  .center-input {
    text-align: center;
  }
</style>
