<template>
  <div class="card" style="width: 18rem; margin: 10px">
    <div class="card-body">
      <h5 class="card-title">{{ todo.header }}</h5>
      <p class="card-text">{{ todo.description }}</p>
      <div style="width: 100%">
        <b-button-group class="special" size="sm">
          <b-button @click="editTodo()" class="btn btn-secondary">Edit</b-button>
          <b-button @click="removeTodo(todo.id)" class="btn btn-danger">Delete</b-button>
        </b-button-group>
      </div>
      <div>
        <b-modal id='edit-modal' v-model="showmodal" @ok="updateTodo(todo.id)">
          <h4>Edit todo</h4>
          <input type = "text" class="form-controll" v-model="edittitle"
          required autofocus placeholder="new title"/>
          <input type = "text" class="form-controll" v-model="editdesc"
          required autofocus placeholder="new description"/>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['todo'],
  data() {
    return {
      editdesc: '',
      edittitle: '',
      showmodal: false,
    };
  },
  methods: {
    removeTodo(id) {
      this.$root.$emit('removeTodo', { id });
    },
    editTodo() {
      this.showmodal = true;
    },
    updateTodo(id) {
      this.$root.$emit('updateTodo', { id, title: this.edittitle, desc: this.editdesc });
    },
  },
  created() {
    this.editdesc = this.todo.description;
    this.edittitle = this.todo.header;
  },


};
</script>

<style scoped>
  .btn-group.special {
    display: flex;
  }

  .special .btn {
    flex: 1;
  }
</style>
