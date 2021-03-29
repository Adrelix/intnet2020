<template>
    <div>
      <b-form-checkbox @change="checkedBox()" v-model="checked"
      :value="true" :unchecked-value="false">
        <span v-bind:class="{'marked': checked, 'notMarked': !checked }">
        {{ item.item }}
      </span>
      </b-form-checkbox>
    </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  props: ['item'],
  data() {
    return {
      checked: null,
      socket: io('localhost:1337'),
    };
  },
  methods: {
    checkedBox() {
      fetch('/api/checkBox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.item.id, listid: this.item.listid,
        }),
      })
        .catch((error) => {
          console.error('Checking box failed unexpectedly');
          this.errMsg = 'Error occured when box check, this shouldn\'t happen';
          throw error;
        });
    },
  },
  mounted() {
    this.socket.on('updateCheckbox', (value, id) => {
      console.log('Got the emit with value and id', value, id);
      if (this.item.id === id) {
        this.checked = value;
      }
    });
  },
  created() {
    if (this.item.value === 1) {
      this.checked = true;
    } else {
      this.checked = false;
    }
  },
};
</script>

<style scoped>
  .listitem {
    width: wrap;
    border-style: solid;
    border-width: small;
    border-radius: 3px;
  }

  .marked{
    text-decoration: line-through;
    text-decoration-color: grey;
    color: grey;
  }

  .notMarked{
    text-decoration: none;
  }
</style>
