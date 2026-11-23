<!--
  用能结构 + 重点损失（设计稿对齐版）
  =============================================================
  - 用能结构：堆叠条 + 横向图例（生产/空调/动力/照明 + pct%）
  - Top 损失 / 异常贡献：左侧编号徽章（top损失标号1/2/3.png）+ 文字 + 右侧 -% 橙黄
-->
<template>
  <!-- <div class="structure-loss"> -->
    <!-- 用能结构（堆叠条 + 图例） -->
    <div class="structure-block">
      <div class="structure-stack">
        <span
          v-for="item in structure"
          :key="item.name"
          :style="{ width: item.pct + '%', background: item.color }"
          :title="`${item.name} ${item.pct}%`"
        ></span>
      </div>
      <div class="structure-legend">
        <span v-for="item in structure" :key="item.name" class="legend-item">
          <i :style="{ background: item.color }"></i>
          {{ item.name }} {{ item.pct }}%
        </span>
      </div>
    </div>
  <!-- </div> -->
</template>

<script>
// 静态 import 三个标号图标，避免中文路径动态拼接问题
import badge1 from "@/assets/images/page_2_6/top损失标号1.png";
import badge2 from "@/assets/images/page_2_6/top损失标号2.png";
import badge3 from "@/assets/images/page_2_6/top损失标号3.png";

export default {
  name: "Structure",
  props: {
    /** 用能结构 [{ name, pct, color, sort }] */
    structure: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      badgeIcons: [badge1, badge2, badge3]
    };
  }
};
</script>

<style lang="scss" scoped>
.structure-loss {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  box-sizing: border-box;
}

/* ===== 用能结构（堆叠条 + 图例）外框 ===== */
.structure-block {
  padding: 1rem 1rem;
  border-radius: 0.15rem;
}

.block-title {
  position: relative;
  font-size: var(--font-size-14);
  color: rgba(238, 248, 253, 0.92);
  font-family: var(--font-family-primary-Medium);
  margin-bottom: 0.3rem;
  padding-bottom: 0.1rem;
  letter-spacing: 0.02em;

  /* 二级标题文字分隔装饰横线 */
  &::after {
    content: "";
    display: block;
    width: 100%;
    height: 0.38rem;
    margin-top: 0.28rem;
    background: url("~@/assets/images/page_2_6/二级标题文字分隔.png")
      no-repeat left center;
    background-size: 100% 100%;
    pointer-events: none;
  }
}

/* ===== 堆叠条：设计稿中是很薄的一条 ===== */
.structure-stack {
  gap: 0.15rem;
  display: flex;
  height: 0.34rem;
  border-radius: 0.6rem;
  overflow: hidden;
  margin-bottom: 0.4rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);

  span {
    display: block;
    height: 100%;
    transition: filter 0.2s;

    &:hover {
      filter: brightness(1.15);
    }
  }
}

.structure-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.3rem 0.45rem;

  .legend-item {
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.78);
    display: inline-flex;
    align-items: center;
    gap: 0.18rem;
    line-height: 1.2;
  }

  i {
    display: inline-block;
    width: 0.34rem;
    height: 0.17rem;
    border-radius: 0.02rem;
  }
}
</style>

