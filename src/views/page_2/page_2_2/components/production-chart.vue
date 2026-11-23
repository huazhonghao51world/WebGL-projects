<template>
  <div class="chart-container">
    <echarts-base :option="chartOption" width="100%" ratio="331/198" />
  </div>
</template>

<script>
import echartsBase from "@/components/echarts/index.vue";
import { baseLineOption } from "@/types/echarts/line.js";

export default {
  name: "ProductionChart",
  components: { echartsBase },
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartOption() {
      // 通过 baseLineOption 生成基础配置并且将图例外置要求写入config
      const option = baseLineOption(
        this.chartData.xData,
        this.chartData.yData,
        null,
        "",
        {
          legendTop: "0%",
          legendLeft: "center",
          legendIcon: "rect",
          legendItemWidth: 10,
          legendItemHeight: 10
        },
        false
      );

      // hover时的十字指示器
      option.tooltip.axisPointer = {
        type: 'line',
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          type: 'solid'
        }
      };
      
      return option;
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
}
</style>
