<!-- src/components/header/setting/date.vue -->
<template>
  <div class="date">
    <span>{{ formattedDate[1] }}</span>
  </div>
</template>

<script>
import { getCurrentFormattedDateRobust } from "@utils/custom.js";

export default {
  name: "Date",
  data() {
    return {
      formattedDate: ["", "", ""], // 存储格式化后的日期信息
      timer: null,
    };
  },
  mounted() {
    this.updateDate(); // 初始化日期
    this.timer = setInterval(this.updateDate, 1000); // 每秒更新一次日期
  },
  methods: {
    updateDate() {
      this.formattedDate = getCurrentFormattedDateRobust();
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer); // 清除定时器
      this.timer = null;
    }
  },
};
</script>

<style lang="scss" scoped>
.date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 4.7rem;

  span {
    font-size: var(--font-size-14);
    font-family: var(--font-family-primary-Medium);
    color: rgba(238, 248, 253, 1);
    letter-spacing: 0.09rem;
  }

  .right {
    display: flex;
    flex-direction: column;
    margin-left: 1rem;

    span {
      font-size: var(--font-size-16);
    }
  }
}
</style>
