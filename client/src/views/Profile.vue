<template>
<div>
    <br>
    <div>
      <AddTodo></AddTodo>
    </div>
    <div class="grid-container">
      <div v-for="todo in todos" :key="todo.id">
        <div>
          <Todo v-bind:todo="todo"></Todo>
        </div>
      </div>
      <div v-for="list in lists" :key="list.title">
        <div>
          <List v-bind:list="list"></List>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import io from 'socket.io-client';
import Todo from './Todo.vue';
import AddTodo from './AddTodo.vue';
import List from './List.vue';

window.addEventListener('keydown', (e) => {
  console.log(e.keyCode);
});

export default {
  data() {
    return {
      todos: [],
      lists: [],
      user: '',
      newheader: '',
      newdescription: '',
      socket: io('localhost:1337'),
    };
  },
  components: {
    Todo,
    AddTodo,
    List,
  },
  methods: {
    addTodo(title, desc) {
      if (title === '' || desc === '') {
        throw new Error('Empty fields can\'t be submitted');
      } else {
        fetch('/api/addTodo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            header: title,
            description: desc,
          }),
        }).catch((error) => {
          console.error('Adding todo failed unexpectedly');
          this.errMsg = 'Error occured when adding todo, this shouldn\'t happen';
          throw error;
        });
      }
    },
    // Get all todos and lists from database.
    getProfile() {
      fetch('/api/getProfile')
        .then(res => res.json())
        .then((data) => {
          this.todos = data.todos;
          this.lists = data.lists;
        })
        .catch(console.error);
    },

    removeTodo(id) {
      fetch('/api/removeTodo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
        }),
      })
        .then((resp) => {
          if (resp.ok) {
            this.todos.forEach((todo) => {
              if (todo.id === id) {
                this.todos.splice(this.todos.indexOf(todo), 1);
              }
            });
          }
        })
        .catch((error) => {
          console.error('Removing todo failed unexpectedly');
          this.errMsg = 'Error occured when removing todo, this shouldn\'t happen';
          throw error;
        });
    },
    removeList(id) {
      fetch('/api/removeList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
        }),
      })
        .then((resp) => {
          if (resp.ok) {
            this.getProfile();
          }
        })
        .catch((error) => {
          console.error('Removing list failed unexpectedly');
          this.errMsg = 'Error occured when removing todo, this shouldn\'t happen';
          throw error;
        });
    },
    addList(title, list) {
      fetch('/api/addList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title, list,
        }),
      })
        .catch((error) => {
          console.error('Adding list failed unexpectedly');
          throw error;
        });
    },
    updateTodo(id, title, desc) {
      fetch('/api/updateTodo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id, title, desc,
        }),
      })
        .catch((error) => {
          console.error('Update todo failed unexpectedly');
          throw error;
        });
    },
  },
  mounted() {
    this.$root.$on('addTodo', (data) => {
      this.addTodo(data.title, data.desc);
    });
    this.$root.$on('addList', (data) => {
      this.addList(data.title, data.list);
    });
    this.$root.$on('removeTodo', (data) => {
      this.removeTodo(data.id);
    });
    this.$root.$on('removeList', (data) => {
      this.removeList(data.id);
    });
    this.socket.on('timeout', () => {
      this.$root.$emit('logout');
    });
    this.socket.on('updateProfile', () => {
      this.getProfile();
    });
    this.$root.$on('updateTodo', (data) => {
      this.updateTodo(data.id, data.title, data.desc);
    });
  },
  created() {
    fetch('/api/getProfile')
      .then(res => res.json())
      .then((data) => {
        this.todos = data.todos;
        this.lists = data.lists;
      })
      .catch(console.error);
  },
};
</script>

<style scoped>

.grid-container {
  width: auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  align-items: baseline;
  align-content: space-around;
  margin: 25px;
  clear: left;
}
</style>
