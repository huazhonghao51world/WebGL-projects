<template>
  <div ref="el" class="xy-chart" :style="{ height: `${height}px` }"></div>
</template>

<script>
import * as echarts from "echarts";

export const palette = ["#38bdf8", "#818cf8", "#f59e0b", "#f87171", "#a78bfa", "#4ade80"];
export const axisStyle = {
  axisLine: { lineStyle: { color: "rgba(255,255,255,.16)" } },
  axisTick: { show: false },
  axisLabel: { color: "#94a3b8", fontSize: 11 },
  splitLine: { lineStyle: { color: "rgba(255,255,255,.06)" } },
};

export default {
  name: "XYChart",
  props: { option: { type: Object, required: true }, height: { type: Number, default: 150 } },
  watch: { option: { deep: true, handler() { this.render(); } } },
  mounted() {
    this.chart = echarts.init(this.$refs.el, null, { renderer: "canvas" });
    this.render();
    this.observer = new ResizeObserver(() => {
      if (!this.chart) return;
      if (this.layout() !== this.applied) this.render();
      else this.chart.resize();
    });
    this.observer.observe(this.$refs.el);
  },
  beforeDestroy() {
    if (this.observer) this.observer.disconnect();
    if (this.chart) this.chart.dispose();
    this.chart = null;
  },
  methods: {
    // option.compact = { maxAspect, option }：容器宽高比不大于 maxAspect 时叠加 compact.option（如环居中、图例在下）
    layout() {
      const { compact } = this.option;
      const el = this.$refs.el;
      if (!compact || !el.clientHeight) return "base";
      return el.clientWidth / el.clientHeight <= compact.maxAspect ? "compact" : "base";
    },
    render() {
      if (!this.chart) return;
      const base = {
        color: palette,
        textStyle: { fontFamily: "OPPOSans-R, Microsoft YaHei, sans-serif" },
        tooltip: { trigger: "axis", backgroundColor: "rgba(15,23,42,.92)", borderColor: "rgba(255,255,255,.14)", borderRadius: 10, padding: [8, 12], extraCssText: "box-shadow:0 12px 32px rgba(2,6,23,.4);", textStyle: { color: "#f8fafc", fontSize: 12 } },
        grid: { left: 38, right: 12, top: 26, bottom: 22 },
        animationDuration: 1000,
        animationEasing: "cubicOut",
        animationDelay: (i) => i * 45,
      };
      const { compact, ...opt } = this.option;
      this.applied = this.layout();
      if (this.applied === "compact") {
        const c = compact.option;
        Object.assign(opt, c, {
          legend: { ...opt.legend, ...c.legend },
          title: { ...opt.title, ...c.title },
          series: opt.series.map((s, i) => ({ ...s, ...(c.series || [])[i] })),
        });
      }
      this.chart.resize();
      this.chart.setOption({ ...base, ...opt, tooltip: { ...base.tooltip, ...opt.tooltip } }, true);
    },
  },
};
</script>

<style scoped>
.xy-chart { width: 100%; }
</style>
