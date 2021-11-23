<template>
  <div id="app">
    <!-- <test>
      <div slot="header">header</div>
      <div slot-scope="scope">solt: {{ scope }}</div>
      <div slot="footer">footer</div>
    </test> -->
    <!-- <test :data="list">
      <span slot-scope="scope">{{ scope.name }} | vm.scopedSlots的使用</span>
    </test> -->
    <my-table :data="tableData" style="width: 100%">
      <my-table-column prop="name" label="姓名"></my-table-column>
      <my-table-column prop="date" label="日期"></my-table-column>
      <my-table-column prop="address" label="地址"></my-table-column>
      <my-table-column prop="opreation" label="操作">
        <span slot-scope="scope">{{ scope.row.name }}</span>
      </my-table-column>
      <!-- <my-table-column prop="address" label="地址"> </my-table-column> -->
    </my-table>
  </div>
</template>

<script>
import myTable from "@/components/my-table/my-table.vue";
import myTableColumn from "@/components/my-table/my-table-column.vue";
import Test from "@/components/Test.vue";
export default {
  name: "App",
  components: {
    Test,
    myTable,
    myTableColumn,
  },
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
      list: [{ name: 111 }, { name: 222 }, { name: 333 }],
    };
  },
  mounted() {},
};
</script>
