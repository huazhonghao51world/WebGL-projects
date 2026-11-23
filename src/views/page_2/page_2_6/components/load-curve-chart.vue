<!--
  全日负荷曲线（设计稿对齐版）
  =============================================================
  支持两种用途：
    1. 左栏「全日负荷曲线 0~24h」：基础负荷线 + 浅蓝面积渐变 + 黄色光伏面积
    2. 右栏「仿真结果对比」：现策略（白） / 验策后（紫虚线） / 光伏（黄面积）
       + showCompare=true 时显示三色图例
-->
<template>
  <div class="load-curve-chart">
    <echarts-base ref="chart" :option="chartOption" :width="'100%'" :height="height" />
  </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { countFontsize } from "@utils/countFontsize.js";

export default {
  name: "LoadCurveChart",
  components: { EchartsBase },
  props: {
    /** 基础负荷曲线 [{ hour, load, pv }] - 来自 overview.loadCurve */
    baseCurve: {
      type: Array,
      default: () => []
    },
    /** 仿真前曲线（来自 simulate_result.curves.beforeCurve） */
    beforeCurve: {
      type: Array,
      default: () => []
    },
    /** 仿真后曲线（来自 simulate_result.curves.afterCurve） */
    afterCurve: {
      type: Array,
      default: () => []
    },
    /** 是否显示对比（仿真完成后） */
    showCompare: {
      type: Boolean,
      default: false
    },
    /** 是否显示 PV 曲线 */
    showPv: {
      type: Boolean,
      default: true
    },
    /** 容器高度 */
    height: {
      type: String,
      default: "3.5rem"
    },
    /**
     * 图表字号缩放倍率
     * - countFontsize 在 1920 下会将初设字号缩到 50%，
     *   导致轴/图例/Tooltip 字过小。
     * - 可通过该 prop 为个别场景上调 (如验策仱真对比图传 1.8，
     *   字号会从 5px 提升到 9px，且仍随分辨率变化)
     */
    fontScale: {
      type: Number,
      default: 1.6
    }
  },
  computed: {
    /** 横轴：0~24h */
    xData() {
      const src = this.showCompare && this.beforeCurve.length
        ? this.beforeCurve
        : this.baseCurve;
      return (src || []).map((d) => `${d.hour}:00`);
    },
    /** 现策略负荷数据 */
    loadData() {
      const src = this.showCompare && this.beforeCurve.length
        ? this.beforeCurve
        : this.baseCurve;
      return (src || []).map((d) => Number(d.load) || 0);
    },
    /** 验策后负荷数据 */
    afterData() {
      return (this.afterCurve || []).map((d) => Number(d.load) || 0);
    },
    /** PV 数据 */
    pvData() {
      const src = this.showCompare && this.beforeCurve.length
        ? this.beforeCurve
        : this.baseCurve;
      return (src || []).map((d) => Number(d.pv) || 0);
    },
    chartOption() {
      const fz = (n) => countFontsize(n * this.fontScale);
      const series = [];

      // 现策略 / 当前负荷
      series.push({
        name: this.showCompare ? "现策略" : "全厂负荷",
        type: "line",
        data: this.loadData,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: "#e8eef5",
          width: fz(2)
        },
        itemStyle: { color: "#e8eef5" },
        // 仅基础视图（非对比）下，给当前曲线加面积渐变作为视觉主体
        areaStyle: this.showCompare
          ? null
          : {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(155, 248, 255, 0.35)" },
                  { offset: 1, color: "rgba(155, 248, 255, 0)" }
                ]
              }
            }
      });

      // 验策后
      if (this.showCompare && this.afterData.length) {
        series.push({
          name: "验策后",
          type: "line",
          data: this.afterData,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: "#a78bfa",
            width: fz(2),
            type: "dashed"
          },
          itemStyle: { color: "#a78bfa" }
        });
      }

      // PV 曲线（光伏出力，黄色面积）
      if (this.showPv && this.pvData.some((v) => v > 0)) {
        series.push({
          name: "光伏",
          type: "line",
          data: this.pvData,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: "#f59e0b",
            width: fz(1.5)
          },
          itemStyle: { color: "#f59e0b" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(245, 158, 11, 0.45)" },
                { offset: 1, color: "rgba(245, 158, 11, 0)" }
              ]
            }
          }
        });
      }

      return {
        backgroundColor: "transparent",
        grid: {
          top: this.showCompare ? fz(28) : fz(14),
          right: fz(10),
          bottom: fz(20),
          left: fz(30)
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(12, 21, 43, 0.92)",
          borderColor: "rgba(72, 120, 180, 0.5)",
          borderWidth: 1,
          textStyle: {
            color: "#fff",
            fontSize: fz(12)
          }
        },
        legend: {
          // 仿真对比模式始终显示三色图例；基础视图隐藏
          show: this.showCompare,
          top: 0,
          right: 0,
          icon: "rect",
          textStyle: {
            color: "rgba(238, 248, 253, 0.7)",
            fontSize: fz(10)
          },
          itemWidth: fz(10),
          itemHeight: fz(2),
          itemGap: fz(10)
        },
        xAxis: {
          type: "category",
          data: this.xData,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "rgba(238, 248, 253, 0.2)" } },
          axisTick: { show: false },
          axisLabel: {
            color: "rgba(238, 248, 253, 0.5)",
            fontSize: fz(10),
            interval: 3
          }
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "rgba(238, 248, 253, 0.08)" } },
          axisLabel: {
            color: "rgba(238, 248, 253, 0.5)",
            fontSize: fz(10)
          }
        },
        series
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.load-curve-chart {
  width: 100%;
  height: 100%;
  min-height: 3rem;
}
</style>
