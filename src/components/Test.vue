<script>
export default {
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  mounted() {
    console.log(this.$slots, "$slots");
    console.log(this.$scopedSlots, "$scopedSlots");
  },
  render(h) {
    return (
      <ul>
        {this.data.map((item, i) => (
          <li>{this.$scopedSlots.default(item)}</li>
        ))}
      </ul>
    );
  },
};
</script>
