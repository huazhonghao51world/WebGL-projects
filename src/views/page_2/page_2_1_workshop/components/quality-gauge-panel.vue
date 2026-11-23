<template>
  <div class="quality-panel">
    <PeriodTabs v-model="activeTab" :tabs="tabs" />

    <div class="gauge-container">
      <echarts-base :option="chartOption" width="100%" height="100%" />
    </div>

    <div class="value-bar">
      <span class="value">{{ displayValue }}</span>
      <span class="unit">%</span>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import echartsBase from '@/components/echarts/index.vue';
import PeriodTabs from '@/components/periodTabs.vue';
import { countFontsize } from "@utils/countFontsize.js";

export default {
  name: 'QualityGaugePanel',
  components: { echartsBase, PeriodTabs },
  props: {
    valueMap: {
      type: Object,
      default: () => ({
        year: 48.2,
        month: 55.6,
        day: 62.1,
      }),
    },
  },
  data() {
    return {
      activeTab: 'year',
      tabs: [
        { key: 'year', label: '年' },
        { key: 'month', label: '月' },
        { key: 'day', label: '日' },
      ],
    };
  },
  computed: {
    currentValue() {
      const value = Number(this.valueMap[this.activeTab]);
      if (Number.isNaN(value)) return 0;
      return Math.max(0, Math.min(100, value));
    },
    displayValue() {
      return this.currentValue.toFixed(1);
    },
    chartOption() {
      const value = this.currentValue;
      return {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '98%',
            center: ['50%', '66%'],
            axisLine: {
              lineStyle: {
                width: countFontsize(20),
                color: [[1, 'rgba(214,222,236,0.62)']],
              },
            },
            progress: {
              show: true,
              width: countFontsize(20),
              roundCap: false,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#1B62FF' },
                  { offset: 1, color: '#79F7FF' },
                ]),
              },
            },
            pointer: {
              show: true,
              icon: 'path://M2,0 L-2,0 L0,-62 Z',
              width: countFontsize(20),
              length: '88%',
              offsetCenter: [0, '6%'],
              itemStyle: {
                color: 'rgba(196, 224, 255, 0.95)',
              },
            },
            anchor: {
              show: true,
              showAbove: true,
              size: countFontsize(28),
              itemStyle: {
                color: '#ffffff',
                borderWidth: countFontsize(18),
                borderColor: 'rgba(92, 165, 255, 0.35)',
              },
            },
            axisTick: {
              show: false,
              distance: -countFontsize(48),
              length: countFontsize(4),
              lineStyle: {
                color: 'rgba(222, 235, 255, 0.8)',
                width: countFontsize(2),
              },
            },
            splitLine: {
              show: true,
              distance: -countFontsize(4),
              length: countFontsize(12),
              lineStyle: {
                color: 'rgba(222, 235, 255, 0.85)',
                width: countFontsize(2),
              },
            },
            axisLabel: {
              distance: -countFontsize(60),
              color: 'rgba(213,230,255,0.9)',
              fontSize: countFontsize(28),
              formatter(valueTick) {
                return valueTick % 10 === 0 ? valueTick : '';
              },
            },
            title: { show: false },
            detail: { show: false },
            data: [{ value }],
          },
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            radius: '106%',
            center: ['50%', '66%'],
            silent: true,
            pointer: { show: false },
            progress: { show: false },
            axisLine: {
              lineStyle: {
                width: 3,
                color: [[1, 'rgba(134, 156, 183, 0.32)']],
              },
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            title: { show: false },
            detail: { show: false },
            data: [{ value: 100 }],
          },
        ],
      };
    },
  },
};
</script>

<style scoped lang="scss">
.quality-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.gauge-container {
  flex: 1;
  min-height: 0;
  margin-top: 0.5rem;
}

.value-bar {
  position: absolute;
  left: 50%;
  bottom: 0.2rem;
  transform: translateX(-50%);
  min-width: 9rem;
  padding: 0.3rem 1.2rem;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.35rem;
  background: linear-gradient(90deg, rgba(39, 86, 168, 0), rgba(39, 86, 168, 0.55), rgba(39, 86, 168, 0));

  .value {
    color: #ffffff;
    font-size: var(--font-size-48);
    line-height: 1;
    font-family: var(--font-family-primary-Bold);
  }

  .unit {
    color: #f0f8ff;
    font-size: var(--font-size-30);
    font-family: var(--font-family-primary-Medium);
  }
}
</style>