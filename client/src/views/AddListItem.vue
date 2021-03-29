<template>
    <div style="clear: right">
        <span>{{ data }}</span>
        <button @click="deleteItem()" class="deleteBtn">X</button>
    </div>
</template>

<script>
export default {
  props: {
    data: String,
  },
  methods: {
    deleteItem() {
      this.$root.$emit('removeItem', this.data);
    },
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
  .deleteBtn {
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    float: right;
  }
  .deleteBtn:hover {
    background: rgb(231, 99, 99);
  }
</style>
