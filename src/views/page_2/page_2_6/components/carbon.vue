<!--
  能耗与碳排（设计稿对齐版）
  =============================================================
  2×3 网格 6 张指标卡：
    1. 当前电价时段     峰段 1.12 元/kWh
    2. 今日电费估算     ¥ 42,798
    3. 峰段用电占比     38%
    4. 碳排当日         126 tCO₂e
    5. 能碳当日强度     0.42 tce/t
    6. 能碳月度预算     78%

  数据来源：
    - data:    overview.carbon[0]   (priceTier/priceValue/costToday/peakShare/carbonToday)
    - overview: overview 完整对象        (energyIntensity/budgetUsed)
-->
<template>
  <div class="energy-carbon">
    <div class="ec-grid">
      <div
        v-for="m in metrics"
        :key="m.key"
        :class="['ec-card', `ec-card--${m.key}`]"
      >
        <div class="ec-head">
          <img
            v-if="m.icon"
            class="ec-icon"
            :src="m.icon"
            :alt="m.label"
          />
          <span class="ec-label">{{ m.label }}</span>
        </div>
        <div class="ec-value">{{ m.value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
// 6 个指标图标（设计稿专属、已拾取到 assets/images/page_2_6/）
import iconPrice from "@/assets/images/page_2_6/当前电价时段.png";
import iconCost from "@/assets/images/page_2_6/今日电费估算.png";
import iconPeakShare from "@/assets/images/page_2_6/峰段用电占比.png";
import iconCarbon from "@/assets/images/page_2_6/碳排当日.png";
import iconIntensity from "@/assets/images/page_2_6/碳排当日强度.png";
import iconBudget from "@/assets/images/page_2_6/能碳月度预算.png";

export default {
  name: "Carbon",
  props: {
    /** 峰谷成本数据：取 overview.carbon[0] 或单条对象 */
    data: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {
    /** 6 个卡片配置，统一从 data + overview 取 */
    metrics() {
      const d = this.data || {};

      // 当前电价时段：组合 priceTier + priceValue
      const priceText = d.priceTier
        ? `${d.priceTier}${d.priceValue ? " " + d.priceValue + " 元/kWh" : ""}`
        : "—";

      return [
        {
          key: "price",
          label: "电价时段",
          icon: iconPrice,
          value: priceText,
          warn: true // 仅"峰段"提示色（沿用旧逻辑：只要有数据就提示）
        },
        {
          key: "cost",
          label: "今日电费",
          icon: iconCost,
          value: d.costToday != null ? `¥ ${this.formatNumber(d.costToday)}` : "—"
        },
        {
          key: "peakShare",
          label: "峰段占比",
          icon: iconPeakShare,
          value: d.peakShare != null ? d.peakShare + "%" : "—"
        }
      ];
    }
  },
  methods: {
    formatNumber(n) {
      if (n == null || n === "") return "—";
      const num = Number(n);
      if (Number.isNaN(num)) return n;
      return num.toLocaleString();
    }
  }
};
</script>

<style lang="scss" scoped>
.energy-carbon {
  width: 100%;
  /* 上下内边距：拉开内容与外边框(section-body)的上下距离 */
  padding: 0.2rem 0rem;
  box-sizing: border-box;
}

.ec-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.34rem 0.34rem;
}

.ec-card {
  padding: 0.2rem 0rem 0.2rem;
  background-image: url("~@/assets/images/page_2_6/数据背景3.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  box-sizing: border-box;
}

.ec-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.76rem;

  .ec-icon {
    flex-shrink: 0;
    width: 1.02rem;
    height: 1.02rem;
    object-fit: contain;
  }

  .ec-label {
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.6);
    font-family: var(--font-family-primary-Regular);
    line-height: 1.2;
  }
}

.ec-value {
  text-align: center;
  font-size: var(--font-size-14);
  color: #fff;
  font-family: var(--font-family-primary-Regular);
  font-weight: 400;
  letter-spacing: 0;
  line-height: 0.875rem;
  padding: 0.02rem 0;

  &.warn {
    color: #fbbf24;
  }
}

/* 电价时段是“峰段 + 数值 + 单位”的紧凑组合，按原型使用 12px；
   其余主要数值（今日电费 / 峰段占比）使用 14px。 */
.ec-card--price .ec-value {
  font-size: var(--font-size-12);
  line-height: 0.75rem;
}
</style>
