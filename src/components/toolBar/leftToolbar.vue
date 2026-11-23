<template>
  <div class="left-toolbar">
    <div
      v-for="item in toolsList"
      :key="item.id"
      class="toolbar-item"
      :class="{ active: item.isActive }"
      @click="selectItem(item)"
      @mouseover="hoveredTool = item.id"
      @mouseleave="hoveredTool = null"
    >
      <div class="toolbar-icon">
        <img :src="(item.isActive || hoveredTool === item.id) ? item.activeIcon : item.icon" :alt="item.label" />
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";

export default {
  name: "LeftToolbar",
  props: {
    toolsData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      toolsList: [],
      hoveredTool: null,
    };
  },
  watch: {
    toolsData: {
      handler(newVal) {
        this.toolsList = JSON.parse(JSON.stringify(newVal));
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    selectItem: debounce(function (item) {
      // 如果点击的是当前激活的按钮，则取消激活
      if (item.isActive) {
        item.isActive = false;
        this.$emit("selectItem", item);
        return;
      }

      // 互斥逻辑：先取消所有按钮的激活状态
      this.toolsList.forEach((toolItem) => {
        if (toolItem.isActive) {
          toolItem.isActive = false;
        }
      });

      // 激活当前点击的按钮
      item.isActive = true;
      this.$emit("selectItem", item);
    }, 300),
  },
};
</script>

<style lang="scss" scoped>
.left-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .toolbar-item {
    cursor: pointer;
    transition: all 0.2s ease;

    .toolbar-label {
      display: none; // 隐藏文字
    }

    .toolbar-icon {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 100%;
        opacity: 0.75;
        object-fit: contain;
        max-width: 100%;
        max-height: 100%;
      }
    }

    &:hover:not(.active) {
      background: rgba(100, 100, 100, 0.2);

      .toolbar-label {
        color: rgba(238, 248, 253, 0.9);
      }

      img {
        opacity: 0.9;
      }
    }

    &.active {
      img {
        opacity: 1;
      }
    }
  }
}
</style>
