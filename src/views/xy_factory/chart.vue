<template>
  <div ref="el" class="xy-chart" :style="{ height: `${height}px` }"></div>
</template>

<script>
import * as echarts from "echarts";

export const palette = ["#3ee6d4", "#4d9cff", "#f5c451", "#ff7a6b", "#a68bff", "#7bd88f"];
export const axisStyle = {
  axisLine: { lineStyle: { color: "rgba(150,190,220,.25)" } },
  axisTick: { show: false },
  axisLabel: { color: "#8fa8c2", fontSize: 11 },
  splitLine: { lineStyle: { color: "rgba(150,190,220,.08)" } },
};

export default {
  name: "XYChart",
  props: { option: { type: Object, required: true }, height: { type: Number, default: 150 } },
  watch: { option: { deep: true, handler() { this.render(); } } },
  mounted() {
    this.chart = echarts.init(this.$refs.el, null, { renderer: "canvas" });
    this.render();
    this.observer = new ResizeObserver(() => this.chart && this.chart.resize());
    this.observer.observe(this.$refs.el);
  },
  beforeDestroy() {
    if (this.observer) this.observer.disconnect();
    if (this.chart) this.chart.dispose();
    this.chart = null;
  },
  methods: {
    render() {
      if (!this.chart) return;
      this.chart.setOption({
        color: palette,
        textStyle: { fontFamily: "Microsoft YaHei, sans-serif" },
        tooltip: { trigger: "axis", backgroundColor: "rgba(8,20,34,.94)", borderColor: "#2a4a66", textStyle: { color: "#e8f3ff", fontSize: 12 } },
        grid: { left: 36, right: 10, top: 24, bottom: 22 },
        ...this.option,
      }, true);
    },
  },
};
</script>

<style scoped>
.xy-chart { width: 100%; }
</style>
