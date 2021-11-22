import { arrayFindIndex } from '@/components/src/utils/util';
import { getCell, getColumnByCell, getRowIdentity } from './util';
import { getStyle, hasClass, removeClass, addClass } from '@/components/src/utils/dom';
import ElCheckbox from '@/components/checkbox';
import ElTooltip from '@/components/tooltip';
import debounce from 'throttle-debounce/debounce';
import LayoutObserver from './layout-observer';
import { mapStates } from './store/helper';

export default {
  name: 'ElTableBody',

  mixins: [LayoutObserver],

  components: {
    ElCheckbox,
    ElTooltip
  },

  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: Boolean
  },

  render() {
    const data = this.data || [];
    return (
      <table
        class="el-table__body"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
          {
            this.columns.map(column => <col name={column.id} key={column.id} />)
          }
        </colgroup>
        <tbody>
          {
            data.reduce((acc, row) => {
              return acc.concat(this.wrappedRowRender(row, acc.length));
            }, [])
          }
          {/* <el-tooltip effect={this.table.tooltipEffect} placement="top" ref="tooltip" content={this.tooltipContent}></el-tooltip> */}
        </tbody>
      </table>
    );
  },

  computed: {
    table() {
      return this.$parent;
    },

    ...mapStates({
      data: 'data',
      columns: 'columns',
      treeIndent: 'indent',
      leftFixedLeafCount: 'fixedLeafColumnsLength',
      rightFixedLeafCount: 'rightFixedLeafColumnsLength',
      columnsCount: states => states.columns.length,
      leftFixedCount: states => states.fixedColumns.length,
      rightFixedCount: states => states.rightFixedColumns.length,
      hasExpandColumn: states => states.columns.some(({ type }) => type === 'expand')
    }),

    firstDefaultColumnIndex() {
      return arrayFindIndex(this.columns, ({ type }) => type === 'default');
    }
  },

  watch: {
    // don't trigger getter of currentRow in getCellClass. see https://jsfiddle.net/oe2b4hqt/
    // update DOM manually. see https://github.com/ElemeFE/element/pull/13954/files#diff-9b450c00d0a9dec0ffad5a3176972e40
    'store.states.hoverRow'(newVal, oldVal) {
      if (!this.store.states.isComplex || this.$isServer) return;
      let raf = window.requestAnimationFrame;
      if (!raf) {
        raf = (fn) => setTimeout(fn, 16);
      }
      raf(() => {
        const rows = this.$el.querySelectorAll('.el-table__row');
        const oldRow = rows[oldVal];
        const newRow = rows[newVal];
        if (oldRow) {
          removeClass(oldRow, 'hover-row');
        }
        if (newRow) {
          addClass(newRow, 'hover-row');
        }
      });
    }
  },

  data() {
    return {
      tooltipContent: ''
    };
  },

  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
  },

  methods: {
    getKeyOfRow(row, index) {
      const rowKey = this.table.rowKey;
      if (rowKey) {
        return getRowIdentity(row, rowKey);
      }
      return index;
    },

    isColumnHidden(index) {
      if (this.fixed === true || this.fixed === 'left') {
        return index >= this.leftFixedLeafCount;
      } else if (this.fixed === 'right') {
        return index < this.columnsCount - this.rightFixedLeafCount;
      } else {
        return (index < this.leftFixedLeafCount) || (index >= this.columnsCount - this.rightFixedLeafCount);
      }
    },

    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1;
      let colspan = 1;
      const fn = this.table.spanMethod;
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          rowIndex,
          columnIndex
        });
        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (typeof result === 'object') {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
      }
      return { rowspan, colspan };
    },

    getRowStyle(row, rowIndex) {
      const rowStyle = this.table.rowStyle;
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        });
      }
      return rowStyle || null;
    },

    getRowClass(row, rowIndex) {
      const classes = ['el-table__row'];
      if (this.table.highlightCurrentRow && row === this.store.states.currentRow) {
        classes.push('current-row');
      }

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-table__row--striped');
      }
      const rowClassName = this.table.rowClassName;
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName);
      } else if (typeof rowClassName === 'function') {
        classes.push(rowClassName.call(null, {
          row,
          rowIndex
        }));
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded');
      }

      return classes;
    },

    getCellStyle(rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle;
      if (typeof cellStyle === 'function') {
        return cellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return cellStyle;
    },

    getCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className];

      if (this.isColumnHidden(columnIndex)) {
        classes.push('is-hidden');
      }

      const cellClassName = this.table.cellClassName;
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName);
      } else if (typeof cellClassName === 'function') {
        classes.push(cellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        }));
      }

      return classes.join(' ');
    },

    getColspanRealWidth(columns, colspan, index) {
      if (colspan < 1) {
        return columns[index].realWidth;
      }
      const widthArr = columns.map(({ realWidth }) => realWidth).slice(index, index + colspan);
      return widthArr.reduce((acc, width) => acc + width, -1);
    },

    handleCellMouseEnter(event, row) {
      const table = this.table;
      const cell = getCell(event);

      if (cell) {
        const column = getColumnByCell(table, cell);
        const hoverState = table.hoverState = { cell, column, row };
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event);
      }

      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell');
      if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
        return;
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange();
      range.setStart(cellChild, 0);
      range.setEnd(cellChild, cellChild.childNodes.length);
      const rangeWidth = range.getBoundingClientRect().width;
      const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0);
      if ((rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth) && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip;
        // TODO 会引起整个 Table 的重新渲染，需要优化
        this.tooltipContent = cell.innerText || cell.textContent;
        tooltip.referenceElm = cell;
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
        tooltip.doDestroy();
        tooltip.setExpectedState(true);
        this.activateTooltip(tooltip);
      }
    },

    handleCellMouseLeave(event) {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.setExpectedState(false);
        tooltip.handleClosePopper();
      }
      const cell = getCell(event);
      if (!cell) return;

      const oldHoverState = this.table.hoverState || {};
      this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event);
    },

    handleMouseEnter: debounce(30, function (index) {
      this.store.commit('setHoverRow', index);
    }),

    handleMouseLeave: debounce(30, function () {
      this.store.commit('setHoverRow', null);
    }),

    handleContextMenu(event, row) {
      this.handleEvent(event, row, 'contextmenu');
    },

    handleDoubleClick(event, row) {
      this.handleEvent(event, row, 'dblclick');
    },

    handleClick(event, row) {
      this.store.commit('setCurrentRow', row);
      this.handleEvent(event, row, 'click');
    },

    handleEvent(event, row, name) {
      const table = this.table;
      const cell = getCell(event);
      let column;
      if (cell) {
        column = getColumnByCell(table, cell);
        if (column) {
          table.$emit(`cell-${name}`, row, column, cell, event);
        }
      }
      table.$emit(`row-${name}`, row, column, event);
    },

    rowRender(row, $index, treeRowData) {
      const { treeIndent, columns, firstDefaultColumnIndex } = this;
      const columnsHidden = columns.map((column, index) => this.isColumnHidden(index));
      const rowClasses = this.getRowClass(row, $index);
      let display = true;

      // 指令 v-show 会覆盖 row-style 中 display
      // 使用 :style 代替 v-show https://github.com/ElemeFE/element/issues/16995
      let displayStyle = display ? null : {
        display: 'none'
      };
      return (<tr>
        {
          columns.map((column, cellIndex) => {
            const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex);
            if (!rowspan || !colspan) {
              return null;
            }
            const columnData = { ...column };
            columnData.realWidth = this.getColspanRealWidth(columns, colspan, cellIndex);
            const data = {
              store: this.store,
              _self: this.context || this.table.$vnode.context,
              column: columnData,
              row,
              $index
            };
            // console.log(this._renderProxy, column);
            //   let children = null;
            // if (this.$scopedSlots.default) {
            //   children = this.$scopedSlots.default(data);
            // } else {
            //   const { row, column } = data
            //   children = row[column.property]
            // }

            return (
              <td>
                {
                  column.renderCell(data)
                }
              </td>
            );
          })
        }
      </tr>);
    },

    wrappedRowRender(row, $index) {
      return this.rowRender(row, $index);
    }
  }
};
