<!--
  供能与微网（设计稿对齐版）
  =============================================================
  2×2 网格 4 张指标卡：
    1. 光伏      pvOutput  Mw
    2. 市电      gridInput Mw
    3. 并网点    gridStatus
    4. 储能SOC   storageSoc %

  数据来源：
    - data: overview.microgrids[0]
-->
<template>
  <div class="energy-carbon">
    <div class="ec-grid">
      <div
        v-for="m in metrics"
        :key="m.key"
        class="ec-card"
      >
        <div class="ec-head">
          <span class="ec-label">{{ m.label }}</span>
          <img
            v-if="m.icon"
            class="ec-icon"
            :src="m.icon"
            :alt="m.label"
          />
        </div>
        <div class="ec-value">{{ m.value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
// 4 个指标图标
import iconPv from "@/assets/images/page_2_6/光伏.png";
import iconGrid from "@/assets/images/page_2_6/市电.png";
import iconNode from "@/assets/images/page_2_6/并网点.png";
import iconSoc from "@/assets/images/page_2_6/储能.png";

export default {
  name: "Microgrid",
  props: {
    /** 微网数据：取 overview.microgrids[0] */
    data: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {
    /** 4 个卡片配置，统一从 data 取 */
    metrics() {
      const d = this.data || {};
      return [
        {
          key: "pv",
          label: "光伏",
          icon: iconPv,
          value: d.pvOutput != null ? `${d.pvOutput} Mw` : "—"
        },
        {
          key: "grid",
          label: "市电",
          icon: iconGrid,
          value: d.gridInput != null ? `${d.gridInput} Mw` : "—"
        },
        {
          key: "node",
          label: "并网点",
          icon: iconNode,
          value: d.gridStatus || "—"
        },
        {
          key: "soc",
          label: "储能SOC",
          icon: iconSoc,
          value: d.storageSoc != null ? `${d.storageSoc}%` : "—"
        }
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
.energy-carbon {
  width: 100%;
  /* 上下内边距：拉开内容与外边框(section-body)的上下距离 */
  padding: 0.2rem 0rem;
  box-sizing: border-box;
}

.ec-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.ec-card {
  padding: 0.2rem 0.4rem 0.2rem;
  background-image: url("~@/assets/images/page_2_6/数据背景.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  box-sizing: border-box;
}

.ec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
  padding: 0 0.2rem;

  .ec-icon {
    flex-shrink: 0;
    width: 1.8rem;
    height: 1.6rem;
    object-fit: contain;
  }

  .ec-label {
    position: relative;
    padding-left: 0.3rem;
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.6);
    font-size: 0.8rem;
    font-family: var(--font-family-primary-Regular);
    line-height: 1.2;

    /* 左侧竖条标记 */
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 0.12rem;
      height: 0.6rem;
      border-radius: 0.06rem;
      background: #9bf8ff;
    }
  }
}

.ec-value {
  text-align: left;
  padding: 0.02rem 0.2rem;
  font-size: 1.125rem;
  color: #9bf8ff;
  font-family: var(--font-family-primary-Regular);
  font-weight: 400;
  letter-spacing: 0.073125rem;
  line-height: 1.25rem;

  &.warn {
    color: #fbbf24;
  }
}
</style>
