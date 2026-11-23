<template>
  <div class="data-stat-card">
    <div class="card-bg">
      <!-- 标题行：标题 + icon -->
      <div class="card-header">
        <span class="card-title">{{ title }}</span>
        <img class="card-icon" :src="icon" :alt="title" />
      </div>

      <!-- 数值 + 单位 -->
      <div class="card-value-row">
        <div class="card-value">{{ value }}</div>
        <div class="card-unit">{{ unit }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataStatCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: 0
    },
    unit: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.data-stat-card {
  width: 100%;
  height: 5rem;

  .card-bg {
    width: 100%;
    height: 100%;
    position: relative;
    background-image: url(~@/assets/images/img/data_card_bg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    padding: 0.4rem 0.6rem 0.32rem 1rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  // 标题行
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: var(--font-size-14);
    color: rgba(238, 248, 253, 0.9);
    font-family: var(--font-family-primary-Regular);
  }

  // 右侧 icon 直接显示图片，不加额外样式
  .card-icon {
    // width: ;
    height: 1.6rem;
    object-fit: contain;
  }

  // 数值行
  .card-value-row {
    display: flex;
    align-items: baseline;
    gap: px2rem(5);
  }

  .card-value {
    font-size: var(--font-size-24);
    font-family: var(--font-family-primary-Medium);
    color: #9BF8FF;
    line-height: 1;
  }

    .card-unit { 
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.7);
    font-family: var(--font-family-primary-Regular);
  }
}
</style>
