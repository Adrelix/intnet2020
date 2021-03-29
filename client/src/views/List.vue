<template>
    <div class="listStyle">
      <h5><span>{{ list.title }}</span></h5>
        <div v-for="item in list.list" :key="item.itemid">
            <ListItem v-bind:item="{item: item.item, id:item.itemid, value:item.value,
            listid: list.id}"></ListItem>
        </div>
        <div style="text-align: center; padding: 5px">
          <b-button size="sm" class="btn btn-danger" @click="remove(list.id)">Delete</b-button>
        </div>
    </div>
</template>

<script>
import ListItem from './ListItem.vue';

export default {
  props: ['list'],
  components: {
    ListItem,
  },
  methods: {
    remove(id) {
      this.$root.$emit('removeList', { id });
    },
  },
};
</script>

<style scoped>
  .listStyle {
    border-style: solid;
    border-width: 1px;
    border-color: lightgray;
    border-radius: 5px;
    padding: 10px 25px 10px 10px;
  }
</style>
