<template>
  <div class="chart-wrap">
    <echarts-base :option="option" width="100%" ratio="364 / 185" />
  </div>
</template>

<script>
import { safetyRectifyOption } from '@/types/echarts/bar.js';
import echartsBase from '@/components/echarts/index.vue';
import { color } from 'echarts';

export default {
  name: 'SafetyRectifyChart',
  components: { echartsBase },
  props: {
    chartData: {
      type: Array,
      default: () => [
        { name: '已闭环', value: 2.8 },
        { name: '整改中', value: 1.4 },
        { name: '其他', value: 0.8 },
      ],
    },
    max: {
      type: Number,
      default: 5,
    },
    interval: {
      type: Number,
      default: 1,
    },
    color: {
      type: String,
      default: "#568AFF",
    },
  },
  computed: {
    option() {
      return safetyRectifyOption(this.chartData, this.max, this.interval, this.color);
    },
  },
};
</script>

<style scoped lang="scss">
.chart-wrap {
  width: 100%;
  height: 100%;
}
</style>
