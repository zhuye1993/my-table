<script>
import { store } from "./index";
export default {
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  created() {
    store.columns.length = 0;
  },
  watch: {
    // data: {
    //   immediate: true,
    //   handler(value) {
    //     // store.list = [];
    //     // store.list.push(...value);
    //     // console.log(store.list, "list");
    //   },
    // },
  },
  render() {
    // slots 也要渲染，需要计算合并表头
    // return h("div", this.$slots.default);
    // return <div>123567</div>;
    console.log(store.columns, "store.columns.");
    // window.store = store;
    return (
      <div>
        <table cellspacing="0" cellpadding="0">
          <thead>
            <tr>
              {store.columns.map((item) => (
                <th>{item.label}</th>
              ))}
            </tr>
          </thead>
          {this.$slots.default}
        </table>
        <table cellspacing="0" cellpadding="0">
          <tbody>
            {this.data.map((item) => {
              return (
                <tr>
                  {store.columns.map((item1) => (
                    <td>{item[item1.prop]}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
};
</script>

<style scoped>
table {
  width: 50% !important;
}
th {
  text-align: left;
}
</style>
