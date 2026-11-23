<template>
  <div class="workshop-table">
    <!-- 表头 -->
    <div
      class="table-header"
      :style="{ color: headerColor, backgroundColor: headerBg }"
    >
      <div
        v-for="col in columns"
        :key="col.key"
        class="header-cell"
        :style="{ flex: col.flex || 1 }"
      >
        {{ col.label }}
      </div>
    </div>

    <!-- 数据行 -->
    <div class="table-body" :class="{ 'add-gap': addGap }">
      <div
        v-for="(row, index) in tableData"
        :key="index"
        :class="['table-row', 'hover-' + rowHoverBgType]"
        :style="{ backgroundColor: rowBg, height: cusHeight }"
      >
        <div
          v-for="col in columns"
          :key="col.key"
          class="table-cell"
          :style="{ flex: col.flex || 1 }"
        >
          <div
            class="common"
            :style="
              typeof col.style === 'function'
                ? col.style(row, index)
                : col.style
            "
            :class="{ 'bigFont': col.key === 'qualified' || col.key === 'oee' || col.key === 'output' }"
          >
            {{ row[col.key] }}

            <div v-if="col.key==='output'" class="unit">台/日</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WorkshopTable",
  props: {
    // 列配置：[{ key, label, flex, type }]
    columns: {
      type: Array,
      default: () => [],
    },
    // 表格数据
    tableData: {
      type: Array,
      default: () => [],
    },
    // 表头文字颜色
    headerColor: {
      type: String,
      default: "#C9D8E5",
    },
    // 表头背景色
    headerBg: {
      type: String,
      default: "transparent",
    },
    // 数据行背景色
    rowBg: {
      type: String,
      default: "rgba(12, 21, 43, 0.5)",
    },
    rowHoverBgType: {
      type: String,
      default: "type1",
    },
    // 数据行高度
    cusHeight: {
      type: String,
      default: "2.52rem",
    },
    // 是否在行之间添加间隔
    addGap: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getStatusClass(value, statusMap, type) {
      // type: 'dot' | 'text'
      let statusStr = "";

      // 优先使用传入的 statusMap
      if (statusMap && statusMap[value]) {
        statusStr = statusMap[value];
      } else {
        // 默认映射关系
        const defaultMap = {
          正常: "primary",
          告警: "danger",
          异常: "danger",
          提示: "warning",
          离线: "info",
        };
        statusStr = defaultMap[value] || "primary";
      }

      return type === "dot" ? `status-${statusStr}` : `text-${statusStr}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.workshop-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-12);
  font-family: var(--font-family-primary-Regular);

  div {
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
  }

  // 表头
  .table-header {
    display: flex;
    align-items: center;
    padding: 0rem 0.7rem 0.3rem 0rem;
    margin-bottom: 0rem;
  }

  .header-cell {
    text-align: center;
  }

  // 数据行
  .table-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    overflow-y: auto;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(99, 118, 141, 0.8);
      border-radius: 2px;

      &:hover {
        background: rgba(99, 118, 141, 1);
      }
    }
  }

  .table-body.add-gap {
    gap: 0.8rem;
  }

  .table-row {
    display: flex;
    align-items: center;
    padding: 0.6rem 0.75rem 0.6rem 0rem;
    gap: 0.1rem;
    height: 2.52rem;
    border-radius: 3px;
    cursor: pointer;
  }

  .hover-type1:hover {
    background-image: url("~@/assets/images/img/table_hover_line.png");
    background-repeat: no-repeat;
    background-position: bottom center;
    background-size: 100% auto;
    background-color: rgba(109, 160, 223, 0.3) !important;
    transition: background-color 0.3s ease;
  }

  .hover-type2:hover {
    background-color: rgba(255, 142, 81, 0.3) !important;
    transition: background-color 0.3s ease;
  }

  .table-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dbf5ff;
    font-family: var(--font-family-primary-Regular);

    .common {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      color: #dbf5ff;
      white-space: pre-wrap;
      line-height: 1.2;

      .unit {
        margin-left: -0.2rem;
        color: rgba(219, 245, 255, 0.6);
        font-size: var(--font-size-12);
      }
    }

    .common.bigFont {
      font-size: var(--font-size-14);
      font-family: var(--font-family-primary-Regular);
    }

    text-align: center;
    word-break: break-all;
  }

  // 车间标签
  .workshop-tag {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background-color: rgba(224, 233, 233, 0.1);
    padding: 0.15rem 0;
  }

  // 风险标签
  .risk-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 4rem;
    height: 1.3rem;
    box-sizing: border-box;
    background-image: url("~@/assets/images/page_1_1/tagType.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
  }

  // 序号标签
  .index-tag {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background-color: rgba(224, 233, 233, 0.25);
    padding: 0.15rem 0;
  }

  .index-text {
    color: #dbf5ff;
    font-size: var(--font-size-12);
  }

  // 趋势列
  .trend-text {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    color: #cad0d8;

    .icon {
      width: 1rem;
      height: 1rem;
      object-fit: contain;
    }
  }

  // 状态圆点列
  .status-dot-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;

    .status-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .inner-dot {
        width: 33.4%;
        height: 33.4%;
        border-radius: 50%;
      }

      &.status-primary {
        background-color: rgba(15, 218, 203, 0.2);

        .inner-dot {
          background-color: #0fdacb;
          box-shadow: 0 0 4px #0fdacb;
        }
      }

      &.status-danger {
        background-color: rgba(255, 109, 109, 0.2);

        .inner-dot {
          background-color: #ff6d6d;
          box-shadow: 0 0 4px #ff6d6d;
        }
      }

      &.status-warning {
        background-color: rgba(255, 208, 81, 0.2);

        .inner-dot {
          background-color: #ffd051;
          box-shadow: 0 0 4px #ffd051;
        }
      }

      &.status-info {
        background-color: rgba(144, 147, 153, 0.2);

        .inner-dot {
          background-color: #909399;
          box-shadow: 0 0 4px #909399;
        }
      }
    }
  }

  .status-text {
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
  }

  .text-primary {
    color: #0fdacb;
  }

  .text-danger {
    color: #ff6d6d;
  }

  .text-warning {
    color: #ffd051;
  }

  .text-info {
    color: #909399;
  }

  .tag-bar {
    display: inline-block;
    width: 1px;
    height: 0.5rem;
    background: #e0e9e9;
    border-radius: 1px;
    flex-shrink: 0;

    // 橙色变体
    &--orange {
      background: #ff8e44;
    }
  }

  .tag-text {
    color: #ebf6ff;
  }

  // 在线数青色高亮
  .online-count {
    color: #9bf8ff;
  }

  .total-count {
    color: rgba(238, 248, 253, 0.6);
  }

  // 橙色高亮文字
  .highlight-orange {
    color: #ffd051;
    font-size: var(--font-size-12);
  }

  // 目标列
  .target-text {
    color: #7df8ff;
  }

  // 左对齐列样式
  .left-column-text {
    display: block;
    width: 100%;
    text-align: left;
    padding-left: 0.3rem;
    color: #dbf5ff;
    white-space: pre-wrap;
    line-height: 1.2;
    font-family: var(--font-family-primary-Regular);
  }

  // 差距列
  .gap-text {
    display: flex;
    align-items: center;
    gap: 0.2rem;

    .icon {
      // width: 8px;
      object-fit: contain;
      margin-right: -0.5rem;
    }

    &.gap-up {
      color: #00e5ff;
    }

    &.gap-down {
      color: #ff5c5c;
    }
  }

  // 处理状态列 (是/否)
  .status-yes-no-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;

    .icon {
      width: px2rem(12);
      object-fit: contain;
    }
  }
}
</style>
