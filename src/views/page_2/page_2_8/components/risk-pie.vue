<template>
  <div class="risk-pie">
    <!-- 左侧：饼图 -->
    <div class="pie-wrap">
      <echarts-base :option="chartOption" width="100%" :ratio="ratio" />
    </div>

    <!-- 右侧：自定义图例 -->
    <div class="legend-wrap">
      <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
        <!-- 状态圆点 -->
        <div class="status-dot" :style="{ backgroundColor: item.color + '33' }">
          <div class="inner-dot" :style="{ backgroundColor: item.color, boxShadow: '0 0 4px ' + item.color }"></div>
        </div>

        <!-- 名称 -->
        <span class="legend-name">{{ item.name }}</span>

        <!-- 数值区 -->
        <div class="legend-values">
          <div class="legend-line-block">
            <span class="color-rect" :style="{ backgroundColor: item.color }"></span>
            <span class="divider-line"></span>
          </div>

          <div class="pct">
            <span class="pct-num">{{ item.percent }}</span>
            <span class="pct-unit">%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { energySourcePieOptionV2 } from "@/types/echarts/pie.js";

export default {
  name: "RiskPie",
  components: { EchartsBase },
  props: {
    data: {
      type: Array,
      default: () => [
        { name: "消防安全", value: 32 },
        { name: "电气隐患", value: 27 },
        { name: "机械伤害", value: 25 },
        { name: "违章行为", value: 16 },
      ],
    },
    colors: {
      type: Array,
      default: () => ["#4FC3F7", "#0FDACB", "#FFD051", "#FF6D6D"],
    },
    bgImage: {
      type: String,
      default: null,
    },
    centerIcon: {
      type: String,
      default: null,
    },
    ratio: {
      type: String,
      default: "1/1",
    },
  },
  computed: {
    total() {
      return this.data.reduce((s, d) => s + d.value, 0);
    },
    legendItems() {
      return this.data.map((item, index) => ({
        name: item.name,
        value: item.value,
        percent: this.total > 0 ? Math.round((item.value / this.total) * 100) : 0,
        color: this.colors[index] || "#4FC3F7",
      }));
    },
    chartOption() {
      return energySourcePieOptionV2(
        this.data,
        this.colors,
        this.bgImage,
        this.centerIcon,
        {
          showLabel: false,
          bgRatio: 1,
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.risk-pie {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pie-wrap {
  flex: 0 0 auto;
  width: 45%;
}

.legend-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.status-dot {
  flex-shrink: 0;
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
}

.legend-name {
  font-size: var(--font-size-14);
  color: #a8b7c1;
  font-family: var(--font-family-primary-Regular);
  flex-shrink: 0;
  white-space: nowrap;
}

.legend-values {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 0.15rem;
  white-space: nowrap;
  position: relative;
  flex: 1;

  .legend-line-block {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    bottom: -0.1rem;
    left: 0;
    gap: 1px;

    .color-rect {
      flex-shrink: 0;
      align-self: flex-start;
      width: 6px;
      height: 2px;
      border-radius: 1px;
    }

    .divider-line {
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.15);
    }
  }

  .pct {
    width: 2.7rem;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 0.05rem;

    .pct-num {
      color: #ffffff;
      font-size: var(--font-size-16);
      font-family: var(--font-family-primary-Bold);
      line-height: 1;
    }

    .pct-unit {
      font-size: var(--font-size-12);
      color: #cad0d8;
      font-family: var(--font-family-primary-Regular);
    }
  }
}
</style>
