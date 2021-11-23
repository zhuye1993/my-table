<script>
import { store } from "./index";
export default {
  props: ["prop", "label"],
  created() {
    let item = {
      prop: this.prop,
      label: this.label,
    };
    item.renderCell = (data) => {
      let children = null;
      if (this.$scopedSlots.default) {
        children = this.$scopedSlots.default(data);
      } else {
        const { row, column } = data;
        children = row[column.prop];
      }
      return <div>{children}</div>;
    };
    store.columns.push(item);
  },
  render(h) {
    return h("div", this.$slots.default);
    // return <td>12</td>;
  },
};
</script>
