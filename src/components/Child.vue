<template>
<!--  <button @click="clickHandler($event)">click me</button>-->
  <div>
    {{msg | getMap}}
  </div>
</template>

<script>
const a = {
  1: '123'
}
export default {
  filters:{
    getMap(val){
      return a[val] || val
    }
  },
  data () {
    return {
      msg: 1
    }
  },
  created() {
    setTimeout(()=>{
      a['1'] = 'hello'
    },1000)
  }
}
</script>

<style scoped>

</style>
