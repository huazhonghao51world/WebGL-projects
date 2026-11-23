<!--
  异常与风险（设计稿对齐版）
  =============================================================
  - 统计信息：告警 / 高风险 / 未闭环 计数条
  - 近24h 折线趋势：告警(黄) / 高风险(红) 两条平滑线
  - 最高关注：红色高亮条 + 详情
  - 编号列表：徽章 1/2/3 + 文字 + 右侧 -% 或 详情
-->
<template>
  <div class="loss">
    <!-- 统计信息 -->
    <div class="risk-stats">
      <div class="stat-item warn">
        <span class="stat-label">告警</span>
        <span class="stat-num">{{ stats.alarm }}</span>
      </div>
      <div class="stat-item danger">
        <span class="stat-label">高风险</span>
        <span class="stat-num">{{ stats.highRisk }}</span>
      </div>
      <div class="stat-item muted">
        <span class="stat-label">未闭环</span>
        <span class="stat-num">{{ stats.unclosed }}</span>
      </div>
    </div>

    <!-- 近24h 折线趋势 -->
    <div class="risk-trend">
      <div class="trend-head">
        <span class="trend-title">近24h</span>
        <div class="trend-legend">
          <span
            v-for="s in series"
            :key="s.key"
            class="legend-item"
          >
            <i :style="{ background: s.color }"></i>{{ s.name }}
          </span>
        </div>
      </div>
      <echarts-base
        v-if="series.length"
        :option="chartOption"
        width="100%"
        height="5rem"
      />
    </div>

    <!-- 最高关注 -->
    <div v-if="featured.length" class="featured-block">
      <div
        v-for="(f, i) in featured"
        :key="`f-${i}`"
        class="featured-item"
        @click="$emit('select', f)"
      >
        <span class="featured-text">{{ f.text }}</span>
        <span class="featured-action">{{ f.action || '详情' }}</span>
      </div>
    </div>

    <!-- 编号列表 -->
    <div class="loss-block">
      <div
        v-for="(loss, idx) in list"
        :key="loss.id"
        class="loss-item"
        @click="$emit('select', loss)"
      >
        <img
          class="loss-badge"
          :src="badgeIcons[idx] || badgeIcons[2]"
          :alt="`第 ${idx + 1} 项`"
        />
        <span class="loss-text">{{ loss.text }}</span>
        <span v-if="loss.pct" class="loss-pct">-{{ loss.pct }}</span>
        <span v-else class="loss-action">{{ loss.action || '详情' }}</span>
      </div>
      <div v-if="!list.length" class="empty-tip">暂无异常数据</div>
    </div>
  </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { countFontsize } from "@utils/countFontsize.js";
// 静态 import 三个标号图标，避免中文路径动态拼接问题
import badge1 from "@/assets/images/page_2_6/top损失标号1.png";
import badge2 from "@/assets/images/page_2_6/top损失标号2.png";
import badge3 from "@/assets/images/page_2_6/top损失标号3.png";

export default {
  name: "Loss",
  components: { EchartsBase },
  props: {
    /** 异常与风险 { stats, trend, featured, list } */
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      badgeIcons: [badge1, badge2, badge3]
    };
  },
  computed: {
    /** 统计计数 */
    stats() {
      return (this.data && this.data.stats) || {};
    },
    /** 折线序列 */
    series() {
      return (this.data && this.data.trend && this.data.trend.series) || [];
    },
    /** 横轴时间点 */
    hours() {
      return (this.data && this.data.trend && this.data.trend.hours) || [];
    },
    /** 最高关注 */
    featured() {
      return (this.data && this.data.featured) || [];
    },
    /** 编号列表 */
    list() {
      return (this.data && this.data.list) || [];
    },
    /** ECharts 配置 */
    chartOption() {
      const fz = (n) => countFontsize(n * 1.6);
      return {
        backgroundColor: "transparent",
        grid: { left: "2%", right: "3%", top: "14%", bottom: "6%", containLabel: true },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(8, 24, 45, 0.9)",
          borderColor: "rgba(155, 248, 255, 0.3)",
          textStyle: { color: "#eef8fd", fontSize: fz(10) }
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.hours,
          axisLine: { lineStyle: { color: "rgba(155, 248, 255, 0.25)" } },
          axisTick: { show: false },
          axisLabel: {
            color: "rgba(238, 248, 253, 0.55)",
            fontSize: fz(10),
            interval: (idx) => idx % 3 === 0
          }
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          splitLine: { lineStyle: { color: "rgba(155, 248, 255, 0.08)" } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "rgba(238, 248, 253, 0.45)", fontSize: fz(10) }
        },
        series: this.series.map((s) => ({
          name: s.name,
          type: "line",
          data: s.data,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: s.color, width: fz(2) },
          itemStyle: { color: s.color }
        }))
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.loss {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  box-sizing: border-box;
}

/* ===== 统计信息 ===== */
.risk-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.1rem 0.2rem;

  .stat-item {
    width: 6rem;
    height: 1.8rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.24rem;
    padding-left: 0.34rem;
    padding-right: 0.34rem;
    background: rgba(255, 142, 81, 0.1);

    /* 左右两侧竖条标记 */
    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 0.16rem;
      height: 0.8rem;
      border-radius: 0.06rem;
      background: #9bf8ff;
    }

    &::before { left: 0; }
    &::after { right: 0; }

    /* 各项颜色：告警黄 / 高风险红 / 未闭环灰 */
    &.warn {
      .stat-num { color: #fbc32b; }
      &::before,
      &::after { background: #fbc32b; }
    }

    &.danger {
      .stat-num { color: #f87171; }
      &::before,
      &::after { background: #f87171; }
    }

    &.muted {
      .stat-num { color: rgba(238, 248, 253, 0.55); }
      &::before,
      &::after { background: rgba(238, 248, 253, 0.55); }
    }
  }

  .stat-label {
    font-size: var(--font-size-14);
    color: rgba(238, 248, 253, 0.9);
    font-family: var(--font-family-primary-Medium);
  }

  .stat-num {
    font-size: 1.5rem;
    color: #9bf8ff;
    font-family: var(--font-family-primary-Bold);
  }
}

/* ===== 折线趋势 ===== */
.risk-trend {
  .trend-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.2rem;

    .trend-title {
      font-size: var(--font-size-12);
      color: rgba(238, 248, 253, 0.65);
      font-family: var(--font-family-primary-Regular);
    }

    .trend-legend {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        font-size: var(--font-size-10);
        color: rgba(238, 248, 253, 0.7);

        i {
          width: 0.5rem;
          height: 0.12rem;
          border-radius: 0.06rem;
        }
      }
    }
  }
}

/* ===== 最高关注 ===== */
.featured-block {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .featured-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.32rem 0.5rem;
    cursor: pointer;
    background: linear-gradient(
      90deg,
      rgba(248, 113, 113, 0.28) 0%,
      rgba(248, 113, 113, 0.08) 100%
    );
    border: 1px solid rgba(248, 113, 113, 0.35);
    border-radius: 0.12rem;
    transition: filter 0.2s;

    &:hover {
      filter: brightness(1.15);
    }

    .featured-text {
      flex: 1;
      min-width: 0;
      font-size: var(--font-size-12);
      color: #ffd7d7;
      font-family: var(--font-family-primary-Medium);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .featured-action {
      flex-shrink: 0;
      font-size: var(--font-size-12);
      color: #f87171;
      font-family: var(--font-family-primary-Medium);
    }
  }
}

/* ===== 编号列表 ===== */
.loss-block {
  display: flex;
  flex-direction: column;
}

.loss-item {
  display: flex;
  align-items: center;
  gap: 0.34rem;
  padding: 0.28rem 0.3rem;
  margin-bottom: 0.38rem;
  cursor: pointer;
  background: url("~@/assets/images/page_2_6/top损失背景.png") no-repeat center
    / 100% 100%;
  transition: filter 0.2s;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    filter: brightness(1.15);
  }

  .loss-badge {
    flex-shrink: 0;
    width: 1.72rem;
    height: 1.72rem;
    object-fit: contain;
  }

  .loss-text {
    flex: 1;
    min-width: 0;
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.85);
    font-family: var(--font-family-primary-Regular);
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loss-pct {
    flex-shrink: 0;
    font-size: var(--font-size-12);
    color: #fbbf24;
    font-family: var(--font-family-primary-Bold);
    letter-spacing: 0.02em;
  }

  .loss-action {
    flex-shrink: 0;
    font-size: var(--font-size-12);
    color: #9bf8ff;
    font-family: var(--font-family-primary-Medium);
  }
}

.empty-tip {
  text-align: center;
  font-size: var(--font-size-10);
  color: rgba(238, 248, 253, 0.4);
  padding: 0.4rem 0;
}
</style>

