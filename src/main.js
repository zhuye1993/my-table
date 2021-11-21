import Vue from 'vue'
import App from './App.vue'
// import router from './router'
// import store from './store'
// import { init } from 'snabbdom/init';
import ElTable from '@/components/table';
import ElTableColumn from '@/components/table-column';
Vue.use(ElTableColumn)
Vue.use(ElTable)
Vue.config.productionTip = false
// eslint-disable-next-line no-unused-vars
// console.log(store)
new Vue({
  el: '#app',
  mounted() {
    // setTimeout(() => {
    //   console.log(this.$store.state.number)

    // }, 2000)
    // console.log(init);
  },
  // router,
  // store,
  render: h => {
    console.log('render');
    return h(App)
  }
})
    // .$mount('#app')
