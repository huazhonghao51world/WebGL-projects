<template>
  <div class="chart-wrap">
    <echarts-base :option="option" width="100%" ratio="364 / 185" />
  </div>
</template>

<script>
import { gradientPieOption } from '@/types/echarts/pie.js';
import echartsBase from '@/components/echarts/index.vue';

export default {
  name: 'PersonnelModule',
  components: { echartsBase },
  props: {
    title: {
      type: String,
      default: '人员',
    },
    chartData: {
      type: Array,
      default: () => [
        { name: '到岗', value: 832 },
        { name: '空缺/其他', value: 12 },
      ],
    },
    colorsMap: {
      type: Object,
      default: () => ({
        '到岗': '#58E5D6',
        '空缺/其他': '#F16E8F',
      }),
    },
    imgs: {
      type: Object,
      default: () => ({
        人员: require('@/assets/images/page_2_1/人员.png'),
      }),
    },
  },
  computed: {
    option() {
      const colors = Object.values(this.colorsMap);
      return gradientPieOption(this.chartData, colors, {
        title: this.title,
        showLegend: false,
        showCenterLabel: false,
        imgs: this.imgs,
        subImgs: this.imgs,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-wrap {
  width: 100%;
  height: 100%;
}
</style>
