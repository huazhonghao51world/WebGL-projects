<template>
  <div class="diagnosis-card">
    <div class="card-header">
      <div class="header-left">
        <div v-if="mergedData.index" class="index-tag">
          <span class="tag-bar"></span>
          <span class="tag-text">{{ mergedData.index }}</span>
          <span class="tag-bar"></span>
        </div>
        <!-- 如果有tagWidth -->
        <base-tag
          v-if="mergedData.tagText"
          :text="mergedData.tagText"
          :style="{ width: mergedData.tagWidth }"
        ></base-tag>
        <span
          v-if="mergedData.title"
          class="title-text"
          :class="{ highlight: mergedData.index || mergedData.orderNo }"
          >{{ mergedData.title }}</span
        >
        <span v-if="mergedData.subTitle" class="sub-title-text">{{
          mergedData.subTitle
        }}</span>
      </div>

      <div class="header-right">
        <slot name="header-right">
          <span v-if="mergedData.time" class="time-text">
            {{ mergedData.time }} <span class="unit">min</span>
          </span>
          <span v-if="mergedData.orderNo" class="order-text">
            {{ mergedData.orderNo }}
          </span>
        </slot>
      </div>
    </div>

    <div class="card-content">
      <slot name="content">
        <template v-if="mergedData.suggestion">
          {{ mergedData.suggestion }}
        </template>

        <template v-else>
          <div class="content-left">
            <span v-if="mergedData.workpiece" class="info-text"
              >工件：<span class="info-val">{{
                mergedData.workpiece
              }}</span></span
            >
            <base-tag
              v-if="mergedData.workshop"
              :text="mergedData.workshop"
              class="workshop-tag"
            ></base-tag>
          </div>

          <div class="content-right">
            <span v-if="mergedData.program" class="info-text"
              >程序：<span class="info-val">{{
                mergedData.program
              }}</span></span
            >
            <span v-if="mergedData.progress" class="info-text">
              进度：<span class="progress-val">{{ mergedData.progress }}</span
              ><span class="unit">%</span>
            </span>
          </div>
        </template>
      </slot>
    </div>
  </div>
</template>

<script>
import BaseTag from "@/components/BaseTag.vue";

export default {
  name: "DiagnosisCard",
  components: {
    BaseTag,
  },
  props: {
    tagText: { type: String, default: "" },
    tagWidth: { type: String, default: "" },
    title: { type: String, default: "" },
    subTitle: { type: String, default: "" },
    suggestion: { type: String, default: "" },

    // CNC队列参数
    index: { type: [String, Number], default: "" },
    time: { type: [String, Number], default: "" },
    workpiece: { type: String, default: "" },
    program: { type: String, default: "" },

    // 订单信息参数
    orderNo: { type: String, default: "" },
    workshop: { type: String, default: "" },
    progress: { type: [String, Number], default: "" },

    config: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    mergedData() {
      return {
        title: this.title || this.config.title,
        tagText: this.tagText || this.config.tagText,
        tagWidth: this.tagWidth || this.config.tagWidth,
        subTitle: this.subTitle || this.config.subTitle,
        suggestion: this.suggestion || this.config.suggestion,
        index: this.index || this.config.index,
        time: this.time || this.config.time,
        workpiece: this.workpiece || this.config.workpiece,
        program: this.program || this.config.program,
        orderNo: this.orderNo || this.config.orderNo,
        workshop: this.workshop || this.config.workshop,
        progress: this.progress || this.config.progress,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.diagnosis-card {
  display: flex;
  flex-direction: column;
  width: 100%;

  .card-header {
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.8rem;
    background: url(~@images/img/diagnosis_card_bg.png) no-repeat center center;
    background-size: 100% 100%;

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-right {
      display: flex;
      align-items: center;
    }
  }

  .title-text {
    font-size: var(--font-size-14);
    color: #9bf8ff;
    font-family: var(--font-family-primary-Medium);

    &.highlight {
      color: #9bf8ff;
    }
  }

  .sub-title-text {
    font-size: var(--font-size-14);
    color: #ffffff;
    font-family: var(--font-family-primary-Regular);
  }

  .index-tag {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(224, 233, 233, 0.1);
    padding: 0.15rem 0;

    .tag-bar {
      display: inline-block;
      width: 2px;
      height: 0.6rem;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 1px;
    }

    .tag-text {
      color: #ebf6ff;
      font-size: var(--font-size-12);
      font-family: var(--font-family-number);
      padding: 0 0.4rem;
    }
  }

  .time-text {
    font-size: var(--font-size-16);
    color: #ffffff;
    font-family: var(--font-family-primary-Bold);
    line-height: 1;
    .unit {
      font-size: var(--font-size-12);
      color: rgba(255, 255, 255, 0.6);
      margin-left: 2px;
      font-family: var(--font-family-primary-Regular);
    }
  }

  .order-text {
    font-size: var(--font-size-12);
    color: rgba(255, 255, 255, 1);
    font-family: var(--font-family-primary-Regular);
  }

  .card-content {
    height: 2.01rem;
    padding: 0.6rem 0.8rem;
    background-color: rgba(224, 233, 233, 0.15);
    color: rgba(255, 255, 255, 1);
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
    line-height: 1.5;

    display: flex;
    justify-content: space-between;
    align-items: center;

    .content-left,
    .content-right {
      display: flex;
      align-items: center;
    }
  }

  .info-text {
    color: #cad0d8;
    font-size: var(--font-size-12);
    display: flex;
    align-items: baseline;
    .info-val {
      color: #dbf5ff;
      font-size: var(--font-size-12);
    }
  }

  .progress-val {
    font-size: var(--font-size-16);
    color: #dbf5ff;
    font-family: var(--font-family-number);
    line-height: 1;
  }

  .unit {
    font-size: var(--font-size-12);
    color: #cad0d8;
    margin-left: 2px;
  }

  ::v-deep .workshop-tag {
    --tag-bg-color: rgba(255, 255, 255, 0.1);
    --tag-bar-color: rgba(255, 255, 255, 0.3);
    --tag-text-color: rgba(255, 255, 255, 0.8);
  }
}
</style>
