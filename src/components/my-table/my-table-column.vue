<script>
import { store } from "./index";
export default {
  props: ["prop", "label"],
  created() {
    store.columns.push({
      prop: this.prop,
      label: this.label,
    });
  },
  render(h) {
    return this.$slots.default ? h("div", this.prop) : null;
    // return <td>12</td>;
  },
};
</script>
