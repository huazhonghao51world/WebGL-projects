<template>
  <div class="gas-monitor-card">
    <div class="gas-title">
      <div class="title-top">
        <!-- 针对带有下标的文本，如SO2进行特殊处理 -->
        <div v-if="titleTop === 'SO2'">SO<sub>2</sub></div>
        <div v-else>{{ titleTop }}</div>
      </div>
      <div class="title-bottom">{{ titleBottom }}</div>
    </div>

    <div class="gas-content">
      <div class="axis-container">
        <!-- 轴线 -->
        <div class="axis-line">
          <!-- 悬浮在高亮刻度正上方的值 -->
          <div class="value-row" :style="{ left: getPercentage(value) + '%' }">
            <span class="value">{{ value }}</span>
            <span class="unit">{{ unit }}</span>
          </div>
          <!-- 刻度点和文本 -->
          <div class="axis-points">
            <div
              v-for="(point, index) in points"
              :key="index"
              class="point-wrapper"
              :class="{
                'is-endpoint': index === 0 || index === points.length - 1,
              }"
              :style="{ left: getPercentage(point) + '%' }"
            >
              <div
                class="point-tick"
                v-if="index !== 0 && index !== points.length - 1"
              ></div>
              <span class="point-label">{{ point }}</span>
            </div>
          </div>
          <!-- 高亮刻度图标，这里只展示当前位置的高亮图标，不使用进度条基底 -->
          <img
            src="@/assets/images/page_2_7/scale.png"
            class="scale-marker"
            :style="{ left: getPercentage(value) + '%' }"
            alt="scale marker"
          />
        </div>
      </div>
    </div>

    <div class="gas-status">
      <div class="status-btn">{{ status }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GasMonitorCard",
  props: {
    titleTop: {
      type: String,
      default: "",
    },
    titleBottom: {
      type: String,
      default: "",
    },
    value: {
      type: [Number, String],
      default: 0,
    },
    unit: {
      type: String,
      default: "",
    },
    points: {
      type: Array,
      default: () => [0, 100],
    },
    status: {
      type: String,
      default: "正常",
    },
  },
  computed: {
    maxPoint() {
      return Math.max(...this.points);
    },
    minPoint() {
      return Math.min(...this.points);
    },
  },
  methods: {
    getPercentage(val) {
      if (this.maxPoint === this.minPoint) return 0;
      let percent =
        ((val - this.minPoint) / (this.maxPoint - this.minPoint)) * 100;
      return Math.min(Math.max(percent, 0), 100);
    },
  },
};
</script>

<style lang="scss" scoped>
.gas-monitor-card {
  height: 3.02rem;
  display: flex;
  align-items: center;
  background: rgba(12, 21, 43, 0.5);
  border-radius: 0.3rem;
  margin-bottom: 0.8rem;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

.gas-title {
  width: 90px;
  text-align: center;
  flex-shrink: 0;

  .title-top {
    font-size: var(--font-size-14);
    color: #dbf5ff;
    font-family: var(--font-family-primary-Bold);

    sub {
      font-size: var(--font-size-10);
    }
  }

  .title-bottom {
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
    color: #bcc5c9;
  }
}

.gas-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;

  .axis-container {
    position: relative;
    height: 50%;
    /* 确保线居中 */
    padding: 0 10px;
    /* 让刻度线两端留有空间展示文本 */
  }

  .axis-line {
    position: relative;
    width: 100%;
    height: 0.13rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1px;

    .value-row {
      position: absolute;
      bottom: 0.4rem;
      /* 刚好悬浮在刻度高亮标记的正上方 */
      transform: translateX(-20%);
      /* 水平居中对齐到当前刻度 */
      display: flex;
      align-items: baseline;
      white-space: nowrap;
      /* 保证数字和单位不换行 */

      .value {
        font-size: var(--font-size-14, 0.2rem);
        /* 让值适当大些凸显 */
        color: #9bf8ff;
        font-family: var(--font-family-primary-Bold);
        font-weight: bold;
        margin-right: 0.05rem;
      }

      .unit {
        font-family: var(--font-family-primary-Regular);
        font-size: var(--font-size-12, 0.12rem);
        color: #bcc5c9;
      }
    }

    .scale-marker {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      /* 高亮刻度高度是刻度线的两倍，2px * 2 = 4px，可以适当稍微大一点点以保证可见度，这里稍微给6px或者根据实际图片设计缩放 */
      height: 0.26rem;
      width: auto;
      z-index: 2;
    }

    .axis-points {
      position: absolute;
      width: 100%;
      height: 100%;
      /* 占满 axis-line 的高度(2px) */
      top: 0;
      left: 0;

      .point-wrapper {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;

        .point-tick {
          width: 0.1rem;
          height: 0.26rem;
          /* 从上方出来的一小节刻度 */
          background: rgba(255, 255, 255, 0.4);
          /* 将刻度点往上移 */
          transform: translateY(-0.26rem);
          position: absolute;
          top: 0;
        }

        .point-label {
          font-size: var(--font-size-12);
          font-family: var(--font-family-primary-Medium);
          color: #bcc5c9;
          line-height: 1;
          /* 将文本往下移，离开线 */
          margin-top: 0.26rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1;
        }
      }
    }
  }
}

.gas-status {
  //   width: 60px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  margin: 0.8rem;

  .status-btn {
    padding: 0.13rem 0.45rem;
    background: rgba(155, 248, 255, 0.2);
    color: #9bf8ff;
    border-radius: 2px;
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Medium);
  }
}
</style>
