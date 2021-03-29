<template>
    <div>
        <div>
          <div class="center-input">
            <input type="text" class="no-border"
            v-model="title" required autofocus placeholder="Title"/>
          </div>
          <br>
            <div class="line" v-for="item in list" :key="item">
              <AddListItem :data="item"></AddListItem>
            </div>
            <form v-on:submit.prevent="addToList()">
              <div class="center-input">
                <input type = "text" class="no-border" v-model="newItem" required autofocus
                placeholder="Add list item..."/>
              </div>
            </form>
            <div style="padding: 5px" class="center-input">
              <b-button variant="outline-primary" @click="done()">Done</b-button>
            </div>
        </div>
    </div>
</template>

<script>
import AddListItem from './AddListItem.vue';

export default {
  data() {
    return {
      list: [],
      title: '',
      newItem: '',
    };
  },
  components: {
    AddListItem,
  },
  methods: {
    addToList() {
      this.list.push(this.newItem);
      this.newItem = '';
    },
    done() {
      // Emit a message containing title and description. This emit is handled in profile.vue
      this.$root.$emit('addList', { title: this.title, list: this.list });

      // Reset input fields
      this.list = [];
      this.newItem = '';
      this.title = '';
    },
  },
  mounted() {
    this.$root.$on('removeItem', (item) => {
      this.list.splice(this.list.indexOf(item), 1);
    });
  },
};
</script>

<style scoped>
.no-border {
  border: 0;
  box-shadow:none;
  border-bottom: 1px solid darkgray;
  width: 95%;
  text-align: center;
}

.line {
  border-style: none none solid none;
  border-width: 1px;
  border-color: darkgray;
}

.center-input {
  text-align: center;
}
  /* .addTodo {
    width: 50%;
    float: center;
    border-style: solid;
    border-width: small;
    border-color: grey;
    border-radius: 3px;
  } */
</style>
