<template>
  <div class="sec-box">
    <div class="sec-box-header">
      <slot name="header"></slot>
    </div>

    <div class="sec-box-divider">
      <img src="~@/assets/images/secBox-split.png" alt="分割线" />
    </div>

    <div class="sec-box-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "SecBox",
};
</script>

<style lang="scss" scoped>
.sec-box {
  display: flex;
  flex-direction: column;
  background: none;
  border: none;
  padding: 0 0.5rem;
}

.sec-box-header {
  flex-shrink: 0;
  span {
    font-size: var(--font-size-14);
    color: rgba(246, 255, 255, 1);
    font-family: var(--font-family-primary-Bold);
    text-shadow: 0px 0px px2rem(4) #689cff;
    color: #f6ffff;
  }
}

.sec-box-divider {
  flex-shrink: 0;
  width: 100%;
  margin: 0.2rem 0;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

.sec-box-content {
  flex: 1;
  overflow: auto;
}
</style>
