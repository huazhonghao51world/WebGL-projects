<template>
  <div class="run-status-list">
    <div class="list-item" v-for="(item, index) in listData" :key="index">
      <div class="item-label">{{ item.label }}</div>
      <div class="item-value" :class="{'cyan-text': true}">{{ item.value }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RunStatusList",
  props: {
    listData: {
      type: Array,
      default: () => [],
    }
  }
};
</script>

<style lang="scss" scoped>
.run-status-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.15rem;
  box-sizing: border-box;
}

.list-item {
  display: flex;
  align-items: center;
  height: 2.51rem;
  
  &:nth-child(odd) {
    background-color: rgba(12, 21, 43, 0.3);
  }
  
  &:nth-child(even) {
    /* 用户指定颜色，由于是暗色UI，为了文字可见度建议带透明度，比如 rgba(224, 233, 233, 0.1) 或者直接用指定的HEX，这里使用带透明度处理，防止白字看不清 */
    background-color: rgba(224, 233, 233, 0.1); 
    // 若必须强行只用该HEX，可以取消注释下面这行：
    // background-color: #E0E9E9; 
  }

  .item-label {
    flex: 1;
    text-align: right;
    padding-right: 1.5rem;
    font-size: var(--font-size-14, 14px);
    color: #ffffff;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .item-value {
    flex: 1.2;
    padding-left: 1.5rem;
    font-size: var(--font-size-14, 14px);
    color: #9BF8FF;
    font-family: var(--font-family-number, 'Agency FB', sans-serif);
  }
}
</style>
