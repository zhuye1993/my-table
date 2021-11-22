<template>
  <div>
    <div class="hidden-columns" ref="hiddenColumns">
      <slot></slot>
    </div>
    <div ref="headerWrapper">
      <table-header
        ref="tableHeader"
        :store="store"
        :default-sort="defaultSort"
      >
      </table-header>
    </div>
    <div ref="bodyWrapper">
      <table-body :context="context" :store="store" :stripe="stripe">
      </table-body>
    </div>
  </div>
</template>

<script type="text/babel">
import ElCheckbox from "@/components/checkbox";
import { debounce, throttle } from "throttle-debounce";
import {
  addResizeListener,
  removeResizeListener,
} from "@/components/src/utils/resize-event";
import Mousewheel from "@/components/src/directives/mousewheel";
import Locale from "@/components/src/mixins/locale";
import Migrating from "@/components/src/mixins/migrating";
import { createStore, mapStates } from "./store/helper";
import TableLayout from "./table-layout";
import TableBody from "./table-body";
import TableHeader from "./table-header";
import TableFooter from "./table-footer";
import { parseHeight } from "./util";

let tableIdSeed = 1;

export default {
  name: "ElTable",
  mixins: [Locale, Migrating],
  props: {
    data: {
      type: Array,
      default: function () {
        return [];
      },
    },

    size: String,

    width: [String, Number],

    height: [String, Number],

    maxHeight: [String, Number],

    fit: {
      type: Boolean,
      default: true,
    },

    stripe: Boolean,

    border: Boolean,

    rowKey: [String, Function],

    context: {},

    showHeader: {
      type: Boolean,
      default: true,
    },

    showSummary: Boolean,

    sumText: String,

    summaryMethod: Function,

    rowClassName: [String, Function],

    rowStyle: [Object, Function],

    cellClassName: [String, Function],

    cellStyle: [Object, Function],

    headerRowClassName: [String, Function],

    headerRowStyle: [Object, Function],

    headerCellClassName: [String, Function],

    headerCellStyle: [Object, Function],

    highlightCurrentRow: Boolean,

    currentRowKey: [String, Number],

    emptyText: String,

    expandRowKeys: Array,

    defaultExpandAll: Boolean,

    defaultSort: Object,

    tooltipEffect: String,

    spanMethod: Function,

    selectOnIndeterminate: {
      type: Boolean,
      default: true,
    },

    indent: {
      type: Number,
      default: 16,
    },

    treeProps: {
      type: Object,
      default() {
        return {
          hasChildren: "hasChildren",
          children: "children",
        };
      },
    },

    lazy: Boolean,

    load: Function,
  },

  components: {
    TableHeader,
    TableFooter,
    TableBody,
    ElCheckbox,
  },

  methods: {
    setCurrentRow(row) {
      this.store.commit("setCurrentRow", row);
    },

    toggleRowSelection(row, selected) {
      this.store.toggleRowSelection(row, selected, false);
      this.store.updateAllSelected();
    },

    toggleRowExpansion(row, expanded) {
      this.store.toggleRowExpansionAdapter(row, expanded);
    },

    clearSelection() {
      this.store.clearSelection();
    },

    clearFilter(columnKeys) {
      this.store.clearFilter(columnKeys);
    },

    clearSort() {
      this.store.clearSort();
    },

    handleMouseLeave() {
      this.store.commit("setHoverRow", null);
      if (this.hoverState) this.hoverState = null;
    },

    updateScrollY() {
      const changed = this.layout.updateScrollY();
      if (changed) {
        this.layout.notifyObservers("scrollable");
        this.layout.updateColumnsWidth();
      }
    },

    handleFixedMousewheel(event, data) {
      const bodyWrapper = this.bodyWrapper;
      if (Math.abs(data.spinY) > 0) {
        const currentScrollTop = bodyWrapper.scrollTop;
        if (data.pixelY < 0 && currentScrollTop !== 0) {
          event.preventDefault();
        }
        if (
          data.pixelY > 0 &&
          bodyWrapper.scrollHeight - bodyWrapper.clientHeight > currentScrollTop
        ) {
          event.preventDefault();
        }
        bodyWrapper.scrollTop += Math.ceil(data.pixelY / 5);
      } else {
        bodyWrapper.scrollLeft += Math.ceil(data.pixelX / 5);
      }
    },

    handleHeaderFooterMousewheel(event, data) {
      const { pixelX, pixelY } = data;
      if (Math.abs(pixelX) >= Math.abs(pixelY)) {
        this.bodyWrapper.scrollLeft += data.pixelX / 5;
      }
    },

    // TODO 使用 CSS transform
    syncPostion: throttle(20, function () {
      const { scrollLeft, scrollTop, offsetWidth, scrollWidth } =
        this.bodyWrapper;
      const {
        headerWrapper,
        footerWrapper,
        fixedBodyWrapper,
        rightFixedBodyWrapper,
      } = this.$refs;
      if (headerWrapper) headerWrapper.scrollLeft = scrollLeft;
      if (footerWrapper) footerWrapper.scrollLeft = scrollLeft;
      if (fixedBodyWrapper) fixedBodyWrapper.scrollTop = scrollTop;
      if (rightFixedBodyWrapper) rightFixedBodyWrapper.scrollTop = scrollTop;
      const maxScrollLeftPosition = scrollWidth - offsetWidth - 1;
      if (scrollLeft >= maxScrollLeftPosition) {
        this.scrollPosition = "right";
      } else if (scrollLeft === 0) {
        this.scrollPosition = "left";
      } else {
        this.scrollPosition = "middle";
      }
    }),

    bindEvents() {
      this.bodyWrapper.addEventListener("scroll", this.syncPostion, {
        passive: true,
      });
      if (this.fit) {
        addResizeListener(this.$el, this.resizeListener);
      }
    },

    unbindEvents() {
      this.bodyWrapper.removeEventListener("scroll", this.syncPostion, {
        passive: true,
      });
      if (this.fit) {
        removeResizeListener(this.$el, this.resizeListener);
      }
    },

    resizeListener() {
      if (!this.$ready) return;
      let shouldUpdateLayout = false;
      const el = this.$el;
      const { width: oldWidth, height: oldHeight } = this.resizeState;

      const width = el.offsetWidth;
      if (oldWidth !== width) {
        shouldUpdateLayout = true;
      }

      const height = el.offsetHeight;
      if ((this.height || this.shouldUpdateHeight) && oldHeight !== height) {
        shouldUpdateLayout = true;
      }

      if (shouldUpdateLayout) {
        this.resizeState.width = width;
        this.resizeState.height = height;
        this.doLayout();
      }
    },

    doLayout() {
      if (this.shouldUpdateHeight) {
        this.layout.updateElsHeight();
      }
      this.layout.updateColumnsWidth();
    },

    sort(prop, order) {
      this.store.commit("sort", { prop, order });
    },

    toggleAllSelection() {
      this.store.commit("toggleAllSelection");
    },
  },

  computed: {
    tableSize() {
      return this.size || (this.$ELEMENT || {}).size;
    },

    bodyWrapper() {
      return this.$refs.bodyWrapper;
    },

    shouldUpdateHeight() {
      return (
        this.height ||
        this.maxHeight ||
        this.fixedColumns.length > 0 ||
        this.rightFixedColumns.length > 0
      );
    },

    bodyWidth() {
      const { bodyWidth, scrollY, gutterWidth } = this.layout;
      return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) + "px" : "";
    },

    bodyHeight() {
      const { headerHeight = 0, bodyHeight, footerHeight = 0 } = this.layout;
      if (this.height) {
        return {
          height: bodyHeight ? bodyHeight + "px" : "",
        };
      } else if (this.maxHeight) {
        const maxHeight = parseHeight(this.maxHeight);
        if (typeof maxHeight === "number") {
          return {
            "max-height":
              maxHeight -
              footerHeight -
              (this.showHeader ? headerHeight : 0) +
              "px",
          };
        }
      }
      return {};
    },

    fixedBodyHeight() {
      if (this.height) {
        return {
          height: this.layout.fixedBodyHeight
            ? this.layout.fixedBodyHeight + "px"
            : "",
        };
      } else if (this.maxHeight) {
        let maxHeight = parseHeight(this.maxHeight);
        if (typeof maxHeight === "number") {
          maxHeight = this.layout.scrollX
            ? maxHeight - this.layout.gutterWidth
            : maxHeight;
          if (this.showHeader) {
            maxHeight -= this.layout.headerHeight;
          }
          maxHeight -= this.layout.footerHeight;
          return {
            "max-height": maxHeight + "px",
          };
        }
      }
      return {};
    },

    fixedHeight() {
      if (this.maxHeight) {
        if (this.showSummary) {
          return {
            bottom: 0,
          };
        }
        return {
          bottom:
            this.layout.scrollX && this.data.length
              ? this.layout.gutterWidth + "px"
              : "",
        };
      } else {
        if (this.showSummary) {
          return {
            height: this.layout.tableHeight
              ? this.layout.tableHeight + "px"
              : "",
          };
        }
        return {
          height: this.layout.viewportHeight
            ? this.layout.viewportHeight + "px"
            : "",
        };
      }
    },

    emptyBlockStyle() {
      if (this.data && this.data.length) return null;
      let height = "100%";
      if (this.layout.appendHeight) {
        height = `calc(100% - ${this.layout.appendHeight}px)`;
      }
      return {
        width: this.bodyWidth,
        height,
      };
    },

    ...mapStates({
      selection: "selection",
      columns: "columns",
      tableData: "data",
      fixedColumns: "fixedColumns",
      rightFixedColumns: "rightFixedColumns",
    }),
  },

  watch: {
    height: {
      immediate: true,
      handler(value) {
        this.layout.setHeight(value);
      },
    },

    maxHeight: {
      immediate: true,
      handler(value) {
        this.layout.setMaxHeight(value);
      },
    },

    currentRowKey: {
      immediate: true,
      handler(value) {
        if (!this.rowKey) return;
        this.store.setCurrentRowKey(value);
      },
    },

    data: {
      immediate: true,
      handler(value) {
        this.store.commit("setData", value);
      },
    },

    expandRowKeys: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.store.setExpandRowKeysAdapter(newVal);
        }
      },
    },
  },

  created() {
    this.tableId = "el-table_" + tableIdSeed++;
    this.debouncedUpdateLayout = debounce(50, () => this.doLayout());
  },

  mounted() {
    this.bindEvents();
    this.store.updateColumns();
    this.doLayout();

    this.resizeState = {
      width: this.$el.offsetWidth,
      height: this.$el.offsetHeight,
    };

    // init filters
    this.store.states.columns.forEach((column) => {
      if (column.filteredValue && column.filteredValue.length) {
        this.store.commit("filterChange", {
          column,
          values: column.filteredValue,
          silent: true,
        });
      }
    });

    this.$ready = true;
  },

  destroyed() {
    this.unbindEvents();
  },

  data() {
    const { hasChildren = "hasChildren", children = "children" } =
      this.treeProps;
    this.store = createStore(this, {
      rowKey: this.rowKey,
      defaultExpandAll: this.defaultExpandAll,
      selectOnIndeterminate: this.selectOnIndeterminate,
      // TreeTable 的相关配置
      indent: this.indent,
      lazy: this.lazy,
      lazyColumnIdentifier: hasChildren,
      childrenColumnName: children,
    });
    const layout = new TableLayout({
      store: this.store,
      table: this,
      fit: this.fit,
      showHeader: this.showHeader,
    });
    return {
      layout,
      isHidden: false,
      renderExpanded: null,
      resizeProxyVisible: false,
      resizeState: {
        width: null,
        height: null,
      },
      // 是否拥有多级表头
      isGroup: false,
      scrollPosition: "left",
    };
  },
};
</script>
<style lang="css">
.hidden-columns {
  display: none;
}
</style>
