<!-- 工厂能耗管控总览 KPI 卡片（左图右文本） -->
<template>
  <div class="overview-kpi">
    <div class="kpi-grid">
      <div
        v-for="kpi in kpiList"
        :key="kpi.key"
        class="kpi-box"
        :class="{ warn: kpi.warn }"
      >
        <img v-if="kpi.icon" class="kpi-icon" :src="kpi.icon" :alt="kpi.label" />
        <div class="kpi-text">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-val">
            <span class="num">{{ kpi.num }}</span>
            <span v-if="kpi.unit" class="unit">{{ kpi.unit }}</span>
          </div>
          <div class="kpi-sub">{{ kpi.sub }}</div>
        </div>
      </div>
    </div>

    <!-- 月度配额（横条进度） -->
    <div class="budget-box" :class="{ warn: budget.warn }">
      <div class="budget-head">
        <span class="budget-label">月度配额</span>
      </div>
      <div class="budget-val">
        <span class="num">{{ budget.used }}%</span>
        <span class="remain" v-if="budget.remain != null">
          剩余{{ budget.remain }}{{ budget.remainUnit }}
        </span>
      </div>
      <div class="budget-bar">
        <div class="budget-bar-fill" :style="{ width: budget.pct + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
// 4 个 KPI 图标（资源已在 assets/images/page_2_6/）
// 静态 import 使 Webpack 能正确哈希路径，避免中文路径动态拼接问题
import iconToday from "@/assets/images/page_2_6/今日综合能耗.png";
import iconIntensity from "@/assets/images/page_2_6/能耗强度.png";
import iconBudget from "@/assets/images/page_2_6/月度预算.png";
import iconPower from "@/assets/images/page_2_6/实时全厂功率.png";

export default {
  name: "OverviewKpi",
  props: {
    /** 接口 overview 完整数据 */
    overview: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    kpiList() {
      const o = this.overview || {};
      return [
        {
          key: "powerNow",
          label: "实时全厂功率",
          icon: iconPower,
          num: o.powerNow != null ? o.powerNow : "—",
          unit: o.powerNow != null ? "MW" : "",
          sub: o.powerNote || "",
          warn: false
        },
        {
          key: "todayMwh",
          label: "今日综合能耗",
          icon: iconToday,
          num: o.todayMwh != null ? o.todayMwh : "—",
          unit: o.todayMwh != null ? "MWh" : "",
          sub: "较昨日 " + (o.todayTrend || ""),
          warn: false
        }
        // {
        //   key: "intensity",
        //   label: "能耗强度",
        //   icon: iconIntensity,
        //   num: o.energyIntensity != null ? o.energyIntensity : "—",
        //   unit: o.energyIntensity != null ? "tce/t" : "",
        //   sub: o.intensityNote || "",
        //   warn: false
        // },
        // {
        //   key: "budget",
        //   label: "月度预算",
        //   icon: iconBudget,
        //   num: o.budgetUsed != null ? o.budgetUsed : "—",
        //   unit: o.budgetUsed != null ? "%" : "",
        //   sub: "已消耗 " + (o.budgetNote || ""),
        //   warn: true
        // }
      ];
    },

    /** 月度配额（大数字 + 剩余量 + 进度条） */
    budget() {
      const o = this.overview || {};
      const used = o.budgetUsed != null ? o.budgetUsed : null;
      return {
        used: used != null ? used : "—",
        pct: Math.max(0, Math.min(100, Number(used) || 0)),
        remain: o.budgetRemain != null ? o.budgetRemain : null,
        remainUnit: o.budgetRemainUnit || "",
        warn: true
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.overview-kpi {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.38rem 0.34rem;
}

.kpi-box {
  /* 透明卡片，左图右文横向布局 */
  padding: 0.3rem 0.32rem;
  background: rgba(12, 21, 43, 0.3);
  border: 1px solid rgba(167, 209, 255, 0.1);
  border-radius: 0.15rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;

  .kpi-icon {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    object-fit: contain;
  }

  .kpi-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.02rem;
  }

  .kpi-label {
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.55);
    font-family: var(--font-family-primary-Regular);
    line-height: 1.2;
    order: 2;
  }

  .kpi-val {
    line-height: 1.15;
    color: #9bf8ff;
    font-family: var(--font-family-primary-Regular);
    font-weight: 400;
    display: flex;
    align-items: baseline;
    gap: 0.15rem;
    order: 1;

    .num {
      font-size: 1.25rem;
      line-height: 1.625rem;
      letter-spacing: 0.01em;
      color: #9bf8ff;
    }

    .unit {
      font-size: var(--font-size-12);
      color: rgba(155, 248, 255, 0.7);
      font-family: var(--font-family-primary-Medium);
    }
  }

  /* 设计稿未展示 sub，隐藏 */
  .kpi-sub {
    display: none;
  }

  &.warn .kpi-val {
    color: #fbbf24;

    .unit {
      color: rgba(251, 191, 36, 0.7);
    }
  }
}

/* ===== 月度配额（横条进度） ===== */
.budget-box {
  margin-top: 0.38rem;
  padding: 0.2rem 0.2rem 0.2rem;
  background: rgba(12, 21, 43, 0.3);
  // border: 1px solid rgba(167, 209, 255, 0.1);
  border-radius: 0.15rem;

  .budget-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
  }

  .budget-label {
    position: relative;
    padding-left: 0.32rem;
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.72);
    font-family: var(--font-family-primary-Regular);
    line-height: 1.2;

    /* 左侧竖条标记 */
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 40%;
      transform: translateY(-50%);
      width: 0.12rem;
      height: 0.5rem;
      border-radius: 0.06rem;
      background: #9bf8ff;
    }
  }

  .budget-val {
    margin: 0.5rem 0.6rem 0.5rem;
    line-height: 1.1;
    color: #ffba44;
    font-family: var(--font-family-primary-Regular);
    font-weight: 400;
    display: flex;
    align-items: baseline;
    gap: 0.1rem;

    .num {
      font-size: 1.5rem;
      line-height: 1.625rem;
      letter-spacing: 0.073125rem;
      color: #ffba44;
    }

    .remain {
      margin-left: auto;
      font-size: var(--font-size-12);
      color: rgba(238, 248, 253, 0.55);
      font-family: var(--font-family-primary-Regular);
      font-size: 0.8rem;
      white-space: nowrap;
    }
  }

  .budget-bar {
    margin: 0.5rem 0.6rem 0.5rem;
    height: 0.4rem;
    border-radius: 0.2rem;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }

  .budget-bar-fill {
    height: 100%;
    border-radius: 0.2rem;
    background: linear-gradient(90deg, #22c55e 0%, #a3e635 45%, #fbbf24 80%, #f97316 100%);
    transition: width 0.4s ease;
  }
}
</style>
