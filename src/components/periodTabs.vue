<template>
  <div class="period-tabs">
    <button
      v-for="item in tabs"
      :key="item.key"
      class="tab-item"
      :class="{ active: value === item.key }"
      type="button"
      @click="$emit('input', item.key)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'PeriodTabs',
  props: {
    value: {
      type: String,
      required: true,
    },
    tabs: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
.period-tabs {
  display: flex;
  width: 9.4rem;
  height: 1.63rem;
  border: 1px solid rgba(118, 145, 177, 0.42);
  background: rgba(30, 53, 83, 0.35);
}

.tab-item {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: rgba(213, 230, 255, 0.92);
  font-size: var(--font-size-12);
  font-family: var(--font-family-primary-Regular);
  letter-spacing: 0.04rem;
  cursor: pointer;

  &.active {
    color: #f0f7ff;
    border: 1px solid #2c8dff;
    background: rgba(20, 76, 172, 0.3) url('~@/assets/images/page_2_1/tab选中.png') center center / 100% 100% no-repeat;
    box-shadow: inset 0 0 14px rgba(36, 126, 255, 0.32);
  }
}
</style>
