<template>
  <div>
    <slot name="header"></slot>
    <slot :test="test"></slot>
    <slot name="footer"></slot>
  </div>
</template>
<script>
export default {
  data() {
    return {
      test: {
        name: "default",
      },
    };
  },
  mounted() {
    console.log(this.$slots, "$slots");
    console.log(this.$scopedSlots, "$scopedSlots");
  },
};
</script>
