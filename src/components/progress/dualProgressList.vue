<template>
  <div class="dual-progress-list">
    <div class="legend-container">
      <div class="legend-item">
        <span class="legend-color expected-color">
          <span class="legend-center"></span>
        </span>
        <span class="legend-text">预计产量</span>
      </div>
      <div class="legend-item">
        <span class="legend-color actual-color">
          <span class="legend-center2"></span>
        </span>
        <span class="legend-text">实际产出</span>
      </div>
    </div>
    <div class="list-container">
      <div class="list-item" v-for="(item, index) in listData" :key="index">
        <base-tag :text="item.label" class="tag"></base-tag>
        <div class="item-progress-section">
          <div class="progress-bar-group">
            <div class="progress-track">
              <div
                class="progress-fill expected-fill"
                :style="{ width: getPercent(item.expected, item.max) + '%' }"
              ></div>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill actual-fill"
                :style="{ width: getPercent(item.actual, item.max) + '%' }"
              ></div>
            </div>
          </div>
          <div class="progress-values">
            <div class="value-text expected-value">{{ item.expected }}</div>
            <div class="value-text actual-value">{{ item.actual }}</div>
          </div>
        </div>
        <div class="item-status">
          <span class="status-tag" :class="getStatusClass(item.status)">{{
            item.status
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTag from "@/components/BaseTag.vue";

export default {
  name: "DualProgressList",
  components: {
    BaseTag,
  },
  props: {
    listData: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getPercent(val, max) {
      if (!max) return 0;
      return Math.min(Math.round((val / max) * 100), 100);
    },
    getStatusClass(status) {
      if (status === "领先") return "status-ahead";
      if (status === "滞后") return "status-lagging";
      if (status === "持平") return "status-equal";
      return "";
    },
  },
};
</script>

<style lang="scss" scoped>
.dual-progress-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

.legend-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding-left: 0.5rem;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .legend-color {
      width: 0.75rem;
      height: 0.75rem;
      display: flex;
      justify-content: center;
      align-items: center;

      .legend-center {
        width: 40%;
        aspect-ratio: 1;
        background-color: #94c2ff;
      }
      
      .legend-center2 {
        width: 40%;
        aspect-ratio: 1;
        background-color: rgba(76, 130, 252, 1);
      }

      &.expected-color {
        background-color: rgba(148, 194, 255, 0.3);
      }

      &.actual-color {
        background-color: rgba(76, 130, 252, 0.3);
      }
    }

    .legend-text {
      color: #c0c8d6;
      font-size: var(--font-size-14, 14px);
      font-family: var(--font-family-primary-Regular, sans-serif);
    }
  }
}

.list-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a5b73;
    border-radius: 2px;
  }
}

.list-item {
  height: 3.02rem;
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(12, 21, 43, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .tag {
    width: 23%;
    margin-right: 0.5rem;
  }

  .item-progress-section {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.3rem;

    .progress-bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;

      .progress-track {
        width: 100%;
        height: 0.3rem;
        background-color: rgba(255, 255, 255, 0.1);
        overflow: hidden;

        .progress-fill {
          height: 100%;
          transition: width 0.5s ease-out;

          &.expected-fill {
            background-color: #849bc8;
          }

          &.actual-fill {
            background-color: #3c75ed;
          }
        }
      }
    }

    .progress-values {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      gap: 0rem;

      .value-text {
        font-family: var(--font-family-primary-Bold, sans-serif);
        font-size: var(--font-size-12, 12px);

        &.expected-value {
          color: rgba(255, 255, 255, 0.8);
        }

        &.actual-value {
          color: #4a8cf8;
        }
      }
    }
  }

  .item-status {
    width: 25%;
    display: flex;
    justify-content: center;
    align-items: center;

    .status-tag {
      padding: 0.2rem 0.8rem;
      border-radius: 4px;
      font-size: var(--font-size-12, 12px);
      font-family: var(--font-family-primary-Regular);
      text-align: center;

      &.last-child {
        border-bottom: none;
      }

      &.status-ahead {
        background-color: rgba(155, 248, 255, 0.2);
        color: #9bf8ff;
      }

      &.status-lagging {
        background-color: rgba(255, 109, 109, 0.2);
        color: #ff6d6d;
      }

      &.status-equal {
        background-color: rgba(219, 245, 255, 0.2);
        color: #dbf5ff;
      }
    }
  }
}
</style>
