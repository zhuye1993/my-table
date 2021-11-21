<template>
<!--  <button @click="clickHandler($event)">click me</button>-->
  <div>
    1111
    <slot name="title"></slot>
    <input v-bind:value="msg"  v-on:input="$emit('on', $event.target.value)"/>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'msg',
    event: 'on'
  },
  props: ['msg'],
  name: "Child",
  methods: {
    clickHandler (e) {
      console.log('Button clicked', e);
      this.$emit('select')
    }
  }
}
</script>

<style scoped>

</style>
