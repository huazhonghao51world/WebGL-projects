<template>
  <div class="axis-params-container">
    <div class="axis-section main-axis">
      <div class="axis-label">
        <span class="axis-title">主轴</span>
      </div>
      <img :src="require('@/assets/images/page_2_5/主轴left.png')" alt="主轴" class="axis-divider-img" />
      <div class="params-row">
        <div class="param-card" v-for="(param, index) in mainAxisParams" :key="'main-' + index">
          <div class="param-label">{{ param.label }}</div>
          <div class="param-value">
            <span class="value-number">{{ param.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="axis-section servo-axis">
      <div class="axis-label servo-label-offset">
        <span class="axis-title">伺服轴</span>
      </div>
      <img :src="require('@/assets/images/page_2_5/伺服轴left.png')" alt="伺服轴" class="axis-divider-img servo-label-offset" />
      <div class="servo-table">
        <div class="servo-header">
          <div class="header-cell empty"></div>
          <div class="header-cell">当前位置</div>
          <div class="header-cell">负载率</div>
          <div class="header-cell">精度</div>
        </div>
        <div class="servo-body">
          <div class="servo-row" v-for="(param, index) in servoAxisParams" :key="'servo-' + index">
            <div class="axis-cell">{{ param.axis }}</div>
            <div class="data-cell">
              <span class="value-number">{{ param.position.value }}</span>
              <span class="value-unit">{{ param.position.unit }}</span>
            </div>
            <div class="data-cell">
              <span class="value-number">{{ param.load.value }}</span>
              <span class="value-unit">{{ param.load.unit }}</span>
            </div>
            <div class="data-cell">
              <span class="value-number">{{ param.precision.value }}</span>
              <span class="value-unit">{{ param.precision.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AxisParams',
  props: {
    mainAxisParams: {
      type: Array,
      default: () => [
        { label: '转速(rpm)', value: '-', unit: '' },
        { label: '负载率(%)', value: '-', unit: '' },
        { label: '温度(℃)', value: '-', unit: '' },
      ],
    },
    servoAxisParams: {
      type: Array,
      default: () => [
        {
          axis: 'X',
          position: { label: '当前位置', value: '-', unit: 'mm' },
          load: { label: '负载率', value: '-', unit: '%' },
          precision: { label: '精度', value: '-', unit: 'mm' },
        },
        {
          axis: 'Y',
          position: { label: '当前位置', value: '-', unit: 'mm' },
          load: { label: '负载率', value: '-', unit: '%' },
          precision: { label: '精度', value: '-', unit: 'mm' },
        },
        {
          axis: 'Z',
          position: { label: '当前位置', value: '-', unit: 'mm' },
          load: { label: '负载率', value: '-', unit: '%' },
          precision: { label: '精度', value: '-', unit: 'mm' },
        },
      ],
    },
  },
  data() {
    return {
      mainAxisIcon: '主轴left.png',
      servoAxisIcon: '伺服轴left.png',
    };
  }
};
</script>

<style lang="scss" scoped>
.axis-params-container {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  height: 100%;
}

.axis-section {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.main-axis {
  flex: 0 0 auto;
  height: 45px;
}

.servo-axis {
  display: flex;
}

.axis-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;

  .axis-title {
    font-size: var(--font-size-14);
    color: #9BF8FF;
    font-family: var(--font-family-primary-Bold);
    writing-mode: horizontal-tb;
    letter-spacing: 0.2rem;
  }
}

.axis-divider-img {
  width: auto;
  // height: 70%;
  object-fit: contain;
}

.params-row {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  margin-left: 0.7rem;
}

.param-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0;
  background-image: url('~@/assets/images/page_2_5/主轴切图.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.3s ease;

}

.servo-table {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.servo-header {
  display: grid;
  grid-template-columns: 0.3rem 1fr 1fr 1fr;
  // gap: 0.5rem;
  padding: 0 0.5rem;
}

.header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: transparent;
  font-size: var(--font-size-12);
  color: rgba(238, 248, 253, 0.7);
  font-family: var(--font-family-primary-Regular);
  white-space: nowrap;

  &.empty {
    background: transparent;
  }
}

.servo-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.servo-row {
  display: grid;
  grid-template-columns: 0.3rem 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
}

.axis-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-12);
  font-weight: bold;
  color: #9BF8FF;
  font-family: var(--font-family-primary-Regular);
}

.data-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.4rem 0.3rem;
  background-image: url('~@/assets/images/page_2_5/伺服轴切图.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0.2rem;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(1.2);
  }

  .value-number {
    font-size: var(--font-size-14);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Bold);
    text-shadow: 0 0 8px rgba(45, 154, 222, 0.6);
  }

  .value-unit {
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.8);
    font-family: var(--font-family-primary-Regular);
  }
}



.param-card .param-label {
  font-size: var(--font-size-10);
  color: var(--color-primary);
  font-family: var(--font-family-primary-Regular);
  margin-bottom: 0.3rem;
  white-space: nowrap;
}

.param-card .param-value {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;

  .value-number {
    font-size: var(--font-size-14);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Bold);
    text-shadow: 0 0 10px rgba(45, 154, 222, 0.8);
  }
}
.servo-label-offset {
  transform: translateY(15px);
}
</style>
