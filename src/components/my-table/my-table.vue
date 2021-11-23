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
  render() {
    return (
      <div>
        {this.$slots.default}
        <table cellspacing="0" cellpadding="0">
          <thead>
            <tr>
              {store.columns.map((item) => (
                <th>{item.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {this.data.map((item) => {
              return (
                <tr>
                  {store.columns.map((column) => {
                    const columnData = { ...column };
                    const data = {
                      column: columnData,
                      row: item,
                    };
                    return <td>{column.renderCell(data)}</td>;
                  })}
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
