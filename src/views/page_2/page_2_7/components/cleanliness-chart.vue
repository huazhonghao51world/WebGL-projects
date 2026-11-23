<template>
  <div class="chart-container">
    <echarts-base :option="chartOption" width="100%" ratio="631/400" />
  </div>
</template>

<script>
import echartsBase from "@/components/echarts/index.vue";
import { baseLineOption } from "@/types/echarts/line.js";

export default {
  name: "CleanlinessChart",
  components: { echartsBase },
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartOption() {
      const option = baseLineOption(
        this.chartData.xData,
        this.chartData.yData,
        ['#9BF8FF'], // 蓝绿色
        "",
        {
          legendTop: "0%",
          legendRight: "0%",
          legendLeft: "auto",
          boundaryGap: false,
          yAxisMin: 1,
          yAxisMax: 9,
          yAxisInterval: 1,
          isShowXsplitLine: false,
          isShowArea: true // Activate gradient area
        },
        false
      );

      // hover时的十字指示器
      if (option.tooltip) {
        option.tooltip.axisPointer = {
          type: 'line',
          lineStyle: {
            color: 'rgba(255,255,255,0.3)',
            type: 'solid'
          }
        };
      }
      
      if (option.yAxis) {
          if(Array.isArray(option.yAxis)) {
              option.yAxis[0].inverse = true;
              option.yAxis[0].axisLabel.formatter = '{value}级';
              
          } else {
              option.yAxis.inverse = true;
              option.yAxis.axisLabel.formatter = '{value}级';
          }
      }

      if (option.series && Array.isArray(option.series)) {
        option.series.forEach(s => {
          if (s.areaStyle) {
            s.areaStyle.origin = 'end'; // 强制向y轴最大值方向沉积
          } else {
            s.areaStyle = { origin: 'end' };
          }
        });
      }

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
