<template>
  <div class="carbon-card">
    <div class="card-left">
      <div class="card-title-wrap">
        <span class="title-bar"></span>
        <span class="card-title">{{ title }}</span>
      </div>
      <div class="card-value-wrap">
        <span class="card-value">{{ value }}</span>
        <span class="card-unit">{{ unit }}</span>
      </div>
    </div>
    <div class="card-right">
      <img :src="icon" :alt="title" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarbonCard',
  props: {
    title: {
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
    },
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.carbon-card {
  width: 100%;
  height: 4.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: url('~@/assets/images/img/bg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: 0 1.2rem;
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }
  
  .card-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;

    .card-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .title-bar {
        width: 0.1rem;
        height: 0.5rem;
        background-color: #60c8dc;
      }

      .card-title {
        font-size: var(--font-size-14);
        color: #fff;
        font-family: var(--font-family-primary-Regular);
      }
    }

    .card-value-wrap {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding-left: 0.2rem;
      margin-top: 0.35rem;
      
      .card-value {
        font-size: var(--font-size-24);
        font-family: var(--font-family-primary-Bold);
        letter-spacing: px2rem(1.17);
        color: #9bf8ff;
      }

      .card-unit {
        padding-top: 0.3rem;
        font-size: var(--font-size-14);
        color: rgba(238, 248, 253, 0.8);;
        font-family: var(--font-family-primary-Regular);
      }
    }
  }

  .card-right {
    img {
      height: 3.5rem;
      object-fit: contain;
    }
  }
}
</style>
