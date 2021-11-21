<template>
  <div id="app">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="date" label="日期"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column prop="opreation" label="操作">
        <span>111</span>
      </el-table-column>
      <!-- <el-table-column prop="address" label="地址"> </el-table-column> -->
    </el-table>
  </div>
</template>

<script>
// import myTable from "@/components/my-table/my-table.vue";
// import myTableColumn from "@/components/my-table/my-table-column.vue";
export default {
  name: "App",
  components: {},
  data() {
    return {
      message: "1",
      tableData: [
        {
          name: "张伟1",
          date: "2021-11-22",
          address: "湖南邵阳",
        },
        {
          name: "张伟2",
          date: "2021-11-22",
          address: "北京朝阳",
        },
        {
          name: "张伟3",
          date: "2021-11-22",
          address: "湖南衡阳",
        },
        {
          name: "张伟4",
          date: "2021-11-22",
          address: "上海人",
        },
      ],
    };
  },
  mounted() {},
};
</script>
