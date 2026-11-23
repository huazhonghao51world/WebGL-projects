<template>
  <div class="workshop-energy">
    <div class="energy-item" v-for="(item, index) in data" :key="index">
      <div class="item-name">
        <img class="deco1" src="@/assets/images/img/decorate1.png" alt="" />
        <span class="name-text">{{ item.name }}</span>
        <img class="deco2" src="@/assets/images/img/decorate2.png" alt="" />
      </div>
      <div class="item-value">
        <div class="digits">
          <span
            class="digit"
            v-for="(char, i) in String(item.value)"
            :key="i"
            >{{ char }}</span
          >
        </div>
        <span class="unit">{{ item.unit }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WorkshopEnergy",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style lang="scss" scoped>
.workshop-energy {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
  //   justify-content: space-around;

  .energy-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0 0.625rem;

    .item-name {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;

      .deco1 {
        height: 1rem;
        flex-shrink: 0;
        margin-right: 0.75rem;
        object-fit: contain;
      }

      .name-text {
        font-size: var(--font-size-14);
        font-family: var(--font-family-primary-Medium);
        color: #fff;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .deco2 {
        flex: 1;
        min-width: 0;
        margin: 0 0.5rem;
        height: 0.285rem;
        /* 如果是细线或渐变长线，建议用 fill 拉伸铺满 */
        // object-fit: fill;
      }
    }

    .item-value {
      display: flex;
      align-items: baseline;
      flex-shrink: 0;

      .digits {
        display: flex;
        gap: 0.37rem;

        .digit {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 1.51rem;
          height: 2.14rem;
          background: rgba(34, 97, 240, 0.2);
          border: 0.0625rem solid rgba(99, 158, 255, 0.4983);
          border-radius: 0.25rem;
          font-size: var(--font-size-22);
          font-family: var(--font-family-primary-Bold);
          color: #fff;
          font-weight: 500;
        }
      }

      .unit {
        margin-left: 0.5rem;
        font-size: var(--font-size-12);
        font-family: var(--font-family-primary-Medium);
        color: #dbf5ff;
        white-space: nowrap;
      }
    }
  }
}
</style>
