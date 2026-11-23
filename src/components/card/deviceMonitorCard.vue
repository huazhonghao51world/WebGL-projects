<template>
  <div class="device-monitor-card" :class="cardTypeClass">
    <div class="card-header">
      <!-- Header Tag -->
      <base-tag
        v-if="config.headerTag"
        :text="config.headerTag"
        class="header-tag"
        :width="tagWidth"
      ></base-tag>

      <!-- Title -->
      <span
        class="device-name"
        :class="{ 'device-name2': config.titleStyle === 'gray' }"
        >{{ config.title }}</span
      >

      <!-- Status (Right Side) -->
      <div class="status-indicator">
        <!-- Render dot only if statusType is not 'text' -->
        <div
          v-if="config.statusType !== 'text'"
          class="status-dot"
          :class="statusClass"
        >
          <div class="inner-dot"></div>
        </div>
        <!-- For text type status, use specific class 'status-text-only' (e.g. gray color) else use status color -->
        <span
          :class="
            config.statusType === 'text'
              ? 'status-text-only'
              : ['status-text', statusClass]
          "
        >
          {{ config.status }}
        </span>
      </div>
    </div>

    <div class="card-content" :class="{ type3: isType3Like }">
      <div
        v-for="(item, index) in config.content"
        :key="'item-' + index"
        class="content-item-wrapper"
        :class="{ 'full-width-group': Array.isArray(item) && !hasOtherTypes }"
      >
        <!-- CASE 1: Array of items -> Info Group with Dividers -->
        <div v-if="Array.isArray(item)" class="info-group">
          <div
            v-for="(subItem, subIndex) in item"
            :key="'group-item-' + index + '-' + subIndex"
            class="group-item"
            :style="{
              width: groupWidths[subIndex] || 'auto',
              flex: !groupWidths[subIndex] && !hasOtherTypes ? '1' : 'none',
            }"
          >
            <!-- Divider before subsequent items -->
            <div v-if="subIndex > 0" class="divider">|</div>

            <!-- Info Item -->
            <div
              class="info-item"
              :style="{
                flex: 1,
                justifyContent: groupWidths[subIndex]
                  ? 'flex-start'
                  : 'flex-start',
              }"
            >
              <span class="info-label" v-if="subItem.label"
                >{{ subItem.label }}{{ subItem.label ? ":" : "" }}</span
              >
              <span
                v-if="subItem.value"
                class="info-value"
                :class="subItem.valueClass"
              >
                {{ subItem.value }}
                <span v-if="subItem.unit" class="unit">{{ subItem.unit }}</span>
              </span>
              <span
                v-else-if="subItem.smallValue"
                class="info-value small-value"
                :class="subItem.valueClass"
              >
                {{ subItem.smallValue }}
                <span v-if="subItem.unit" class="unit">{{ subItem.unit }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- CASE 2: Single Tag Item -->
        <base-tag
          v-else-if="item.type === 'tag'"
          :text="item.value"
          class="tag-in-content"
          :class="item.class"
        ></base-tag>

        <!-- CASE 3: Single Status Item -->
        <div
          v-else-if="item.type === 'status'"
          class="status-indicator content-status"
        >
          <div class="status-dot" :class="getStatusClass(item.value)">
            <div class="inner-dot"></div>
          </div>
          <span class="status-text" :class="getStatusClass(item.value)">{{
            item.value
          }}</span>
        </div>

        <!-- CASE 4: Standard Info Item (Standalone, no divider) -->
        <div v-else class="info-item">
          <span class="info-label" v-if="item.label"
            >{{ item.label }}{{ item.label ? ":" : "" }}</span
          >
          <span v-if="item.value" class="info-value" :class="item.valueClass">
            {{ item.value }}
            <span v-if="item.unit" class="unit">{{ item.unit }}</span>
          </span>
          <span
            v-else-if="item.smallValue"
            class="info-value small-value"
            :class="item.valueClass"
          >
            {{ item.smallValue }}
            <span v-if="item.unit" class="unit">{{ item.unit }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseTag from "@/components/BaseTag.vue";

export default {
  name: "DeviceMonitorCard",
  components: {
    BaseTag,
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: "",
        status: "",
        content: [],
      }),
    },
    groupWidths: {
      type: Array,
      default: () => [],
    },
    tagWidth: {
      type: String,
      default: "",
    },
  },
  computed: {
    hasOtherTypes() {
      if (!this.config || !this.config.content) return false;
      return this.config.content.some((item) => !Array.isArray(item));
    },
    isType3Like() {
      return false;
    },
    statusClass() {
      return this.getStatusClass(this.config.status);
    },
    cardTypeClass() {
      switch (this.statusClass) {
        case "status-primary":
          return "type-primary";
        case "status-warning":
          return "type-warning";
        case "status-danger":
          return "type-danger";
        case "status-info":
          return "type-info";
        default:
          return "type-primary";
      }
    },
  },
  methods: {
    getStatusClass(statusText) {
      switch (statusText) {
        case "运行":
        case "合格":
        case "入库":
        case "已完成":
        case "充足":
          return "status-primary";
        case "待机":
        case "返工":
        case "告警":
        case "加工中":
        case "出库":
          return "status-warning";
        case "故障":
        case "不合格":
        case "耗尽":
        case "缺货":
        case "异常":
          return "status-danger";
        case "报废":
          return "status-info";
        default:
          return "status-primary";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.device-monitor-card {
  display: flex;
  flex-direction: column;
  width: 100%;

  .card-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.8rem;
    height: 2.01rem;
    background: rgba(12, 21, 43, 0.4);
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      border-top: 0.6rem solid #0fdacb;
      border-right: 0.6rem solid transparent;
    }
  }

  /* Status Colors */
  &.type-primary .card-header::before {
    border-top-color: #0fdacb;
  }
  &.type-warning .card-header::before {
    border-top-color: #ffd051;
  }
  &.type-danger .card-header::before {
    border-top-color: #ff6d6d;
  }
  &.type-info .card-header::before {
    border-top-color: #999999;
  }

  .header-tag {
    margin-right: 1rem;
  }

  .device-name {
    font-size: var(--font-size-14);
    color: #9bf8ff;
    font-family: var(--font-family-primary-Medium);
    flex: 1;

    &.device-name2 {
      color: #c0d0d5;
    }
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .status-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .inner-dot {
      width: 33.4%;
      height: 33.4%;
      border-radius: 50%;
    }

    &.status-primary {
      background-color: rgba(15, 218, 203, 0.2);
      .inner-dot {
        background-color: #0fdacb;
        box-shadow: 0 0 4px #0fdacb;
      }
    }
    &.status-warning {
      background-color: rgba(255, 208, 81, 0.2);
      .inner-dot {
        background-color: #ffd051;
        box-shadow: 0 0 4px #ffd051;
      }
    }
    &.status-danger {
      background-color: rgba(255, 109, 109, 0.2);
      .inner-dot {
        background-color: #ff6d6d;
        box-shadow: 0 0 4px #ff6d6d;
      }
    }
    &.status-info {
      background-color: rgba(153, 153, 153, 0.2);
      .inner-dot {
        background-color: #999999;
        box-shadow: 0 0 4px #999999;
      }
    }
  }

  .status-text {
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);

    &.status-primary {
      color: #0fdacb;
    }
    &.status-warning {
      color: #ffd051;
    }
    &.status-danger {
      color: #ff6d6d;
    }
    &.status-info {
      color: #999999;
    }
  }

  .status-text-only {
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
    color: #c0d0d5;
  }

  .card-content {
    height: 2.01rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.8rem;
    background-color: rgba(255, 255, 255, 0.08);
    color: rgba(238, 248, 253, 0.7);
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);

    .tag-in-content {
      margin-right: 0;
      width: 4rem;

      &.tag-type3 {
        --tag-bg-color: rgba(51, 87, 141, 0.6);
        width: 4.5rem;
      }

      &.tag-blue-bg {
        --tag-bg-color: rgba(45, 154, 222, 0.3);
        --tag-text-color: #9bf8ff;
      }
    }
  }

  .content-item-wrapper {
    display: flex;
    align-items: center;

    &.full-width-group {
      flex: 1;
      width: 100%;
    }
  }

  .info-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .group-item {
    display: flex;
    align-items: center;
  }

  .info-item {
    display: flex;
    color: #cad0d8;
    align-items: center;
    white-space: nowrap;

    .small-value {
      font-size: var(--font-size-10);
      line-height: 1.2;
      white-space: normal;
    }
  }

  .info-label {
    color: #cad0d8;
    font-size: var(--font-size-12);
  }

  .info-value {
    color: #dbf5ff;
    font-size: var(--font-size-12);
    margin-left: 0.3rem; 
    white-space: nowrap;

    &.small-value {
      font-size: var(--font-size-10);
      line-height: 1.2;
      white-space: normal;
      word-break: break-all;
    }
  }

  .load-value {
    font-size: var(--font-size-16);
    font-family: var(--font-family-number);
    line-height: 1;
  }

  .unit {
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
  }

  .divider {
    color: rgba(238, 248, 253, 0.3);
    margin: 0 0.5rem;
  }
}
</style>
