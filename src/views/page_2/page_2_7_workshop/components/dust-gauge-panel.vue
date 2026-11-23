<template>
  <div class="dust-panel">
    <div class="dust-indicator">
      <div class="gauge-container">
        <echarts-base :option="chartOptionPM25" width="100%" height="100%" />
      </div>
      <div class="label">PM2.5</div>
      <div class="value-bar">
        <span class="value">{{ pm25Value }}</span>
      </div>
    </div>
    
    <div class="dust-indicator">
      <div class="gauge-container">
        <echarts-base :option="chartOptionPM10" width="100%" height="100%" />
      </div>
      <div class="label">PM10</div>
      <div class="value-bar">
        <span class="value">{{ pm10Value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import echartsBase from '@/components/echarts/index.vue';
import { countFontsize } from "@utils/countFontsize.js";

export default {
  name: 'DustGaugePanel',
  components: { echartsBase },
  props: {
    pm25Value: {
      type: Number,
      default: 28,
    },
    pm10Value: {
      type: Number,
      default: 42,
    },
  },
  methods: {
    getChartOption(value, max) {
      return {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: max,
            splitNumber: 5,
            radius: '108%',
            center: ['50%', '85%'],
            axisLine: {
              lineStyle: {
                width: countFontsize(14),
                color: [[1, 'rgba(214,222,236,0.3)']],
              },
            },
            progress: {
              show: true,
              width: countFontsize(14),
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
              width: countFontsize(14),
              length: '80%',
              offsetCenter: [0, '6%'],
              itemStyle: {
                color: 'rgba(196, 224, 255, 0.95)',
              },
            },
            anchor: {
              show: true,
              showAbove: true,
              size: countFontsize(15),
              itemStyle: {
                color: '#ffffff',
                borderWidth: countFontsize(20),
                borderColor: 'rgba(92, 165, 255, 0.6)',
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: true,
              distance: -countFontsize(7),
              length: countFontsize(5),
              lineStyle: {
                color: 'rgba(222, 235, 255, 0.6)',
                width: 1,
              },
            },
            axisLabel: {
              distance: -countFontsize(38),
              color: 'rgba(213,230,255,0.9)',
              fontSize: countFontsize(20),
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
            max: max,
            radius: '120%',
            center: ['50%', '85%'],
            silent: true,
            pointer: { show: false },
            progress: { show: false },
            axisLine: {
              lineStyle: {
                width: countFontsize(6),
                color: [[1, 'rgba(134, 156, 183, 0.2)']],
              },
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            title: { show: false },
            detail: { show: false },
            data: [{ value: max }],
          }
        ],
      };
    }
  },
  computed: {
    chartOptionPM25() {
      return this.getChartOption(this.pm25Value, 250);
    },
    chartOptionPM10() {
      return this.getChartOption(this.pm10Value, 350);
    }
  },
};
</script>

<style scoped lang="scss">
.dust-panel {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}

.dust-indicator {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.gauge-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}

.label {
  font-size: var(--font-size-12);
  color: #79F7FF;
  margin-top: 0.2rem;
  font-family: var(--font-family-primary-Medium);
}

.value-bar {
  margin-top: 0.2rem;
  min-width: 6rem;
  padding: 0.1rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, rgba(39, 86, 168, 0), rgba(39, 86, 168, 0.6), rgba(39, 86, 168, 0));
  
  .value {
    color: #ffffff;
    font-size: var(--font-size-16);
    line-height: 1.2;
    font-family: var(--font-family-primary-Bold);
  }
}
</style>
