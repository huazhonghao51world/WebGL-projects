<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
}

.suggestions-container {
  flex: 1;
  overflow-y: auto; 

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 16, 30, 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(45, 154, 222, 0.5);
    border-radius: 2px;

    &:hover {
      background: rgba(45, 154, 222, 0.7);
    }
  }
}

.stat-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.35rem;
  box-sizing: border-box;
  height: 100%;
}

.resource-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-content: stretch;
}

.env-cards-container {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem 1.6rem;
  padding: 0.8rem 1rem;
  box-sizing: border-box;

  :deep(.env-data-card) {
    gap: 0.8rem;

    img {
      width: 2.8rem;
      height: 3.2rem;
      object-fit: contain;
    }

    .data-card-content {
      gap: 0.2rem;
    }

    .data-card-label {
      font-size: var(--font-size-14);
      color: rgba(238, 248, 253, 0.92);
    }

    .data-card-value {
      .value-number {
        font-size: var(--font-size-20);
      }

      .value-unit {
        font-size: var(--font-size-12);
        color: rgba(219, 245, 255, 0.85);
      }
    }
  }
}

// 1470
.content-left {
  .flow-statistics {
    height: 20%;
  }

  .event {
    height: 20%;

    .box-main-content {
      padding: 0.5rem;
    }
  }

  .type-statistics {
    height: 20.2%;

    .box-main-content {
      height: 100%;
      // background-color: rgba(255,255,255,0.5);
    }
  }

  .pass-tatistics {
    height: 20%;

    .box-main-content {
      height: 100%;
    }
  }
}

.content-right {
  .car-flow {
    height: 95%;

    .box-main-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1rem;
    }
  }

  .header-right-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.5rem;
    background: linear-gradient(
      135deg,
      rgba(139, 116, 88, 0.6),
      rgba(139, 116, 88, 0.3)
    );
    border-radius: 0.3rem;
    cursor: pointer;
    transition: all 0.3s ease;

    span {
      font-size: var(--font-size-12);
      color: #ffe5b1;
      font-family: var(--font-family-primary-Regular);
      letter-spacing: 0.1rem;
      line-height: 1;
    }

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(139, 116, 88, 0.8),
        rgba(139, 116, 88, 0.5)
      );
      border-color: rgba(139, 116, 88, 1);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(139, 116, 88, 0.4);

      span {
        color: rgba(238, 248, 253, 1);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.header-tool-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  justify-content: center;
  align-items: center;

  .action-btn {
    padding: 1rem 2.5rem;
    background: linear-gradient(
      135deg,
      rgba(45, 154, 222, 0.3),
      rgba(45, 154, 222, 0.1)
    );
    border: 1px solid rgba(45, 154, 222, 0.5);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    span {
      font-size: var(--font-size-16);
      color: rgba(238, 248, 253, 0.9);
      font-family: var(--font-family-primary-Regular);
    }

    &:hover:not(.disabled) {
      background: linear-gradient(
        135deg,
        rgba(45, 154, 222, 0.5),
        rgba(45, 154, 222, 0.2)
      );
      border-color: rgba(45, 154, 222, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 154, 222, 0.3);

      span {
        color: rgba(238, 248, 253, 1);
      }
    }

    &:active:not(.disabled) {
      transform: translateY(0);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: linear-gradient(
        135deg,
        rgba(100, 100, 100, 0.2),
        rgba(100, 100, 100, 0.1)
      );
      border-color: rgba(150, 150, 150, 0.3);
    }
  }
}

.left-toolbar {
  margin-bottom: 1.3rem;
}
</style>

<template>
  <Layout :aside="true">
    <template v-slot:aside-left-tools>
      <LeftToolbar
        :toolsData="leftTools"
        @selectItem="handleToolSelect"
        class="left-toolbar"
      />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="flow-statistics" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>综合看板</h1>
          </template>
          <div class="box-main-content">
            <div class="stat-cards-grid">
              <DataStatCard
                v-for="item in statCards"
                :key="item.title"
                :title="item.title"
                :icon="item.icon"
                :value="item.value"
                :unit="item.unit"
              />
            </div>
          </div>
        </Box>

        <Box class="event" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>生产资源</h1>
          </template>
          <div class="box-main-content">
            <div class="resource-list">
              <ProductionResourceItem
                v-for="(item, index) in productionResourceList"
                :key="index"
                :center-label="item.centerLabel"
                :center-icon="item.centerIcon"
                :left-label="item.left.label"
                :left-icon="item.left.icon"
                :left-value="item.left.value"
                :left-unit="item.left.unit"
                :left-danger="item.left.danger"
                :right-label="item.right.label"
                :right-icon="item.right.icon"
                :right-value="item.right.value"
                :right-unit="item.right.unit"
                :right-danger="item.right.danger"
              />
            </div>
          </div>
        </Box>

        <Box class="type-statistics" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>环境</h1>
          </template>
          <div class="box-main-content">
            <div class="env-cards-container">
              <DataCard
                v-for="item in envDataList"
                :key="item.label"
                :iconPath="item.iconPath"
                :label="item.label"
                :value="item.value"
                :unit="item.unit"
                :valueFirst="true"
                class="env-data-card"
              />
            </div>
          </div>
        </Box>

        <Box class="pass-tatistics" :delayTime="400" position="left">
          <template v-slot:header>
            <h1>安防</h1>
          </template>
          <div class="box-main-content">
            <SafetyRectifyChart
              :chartData="safetyChartData"
              :max="5"
              :interval="1"
              color="#568AFF"
            />
          </div>
        </Box>
      </div>
    </template>

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="car-flow" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>诊断与建议</h1>
          </template>

          <template v-slot:header-right>
            <div class="header-right-btn">
              <span>关键结论</span>
            </div>
          </template>

          <div class="box-main-content">
            <div class="suggestions-container">
              <SuggestionCard
                v-for="(item, index) in suggestionList"
                :key="index"
                :label="item.label"
                :content="item.content"
                :aspectRatio="'324/56'"
              />
            </div>

            <!-- <div class="action-buttons">
              <div class="action-btn" @click="goToWorkshop">
                <span>车间</span>
              </div>
              <div class="action-btn disabled">
                <span>仓库</span>
              </div>
              <div class="action-btn disabled">
                <span>设备</span>
              </div>
            </div> -->
          </div>
        </Box>
      </div>
    </template>
  </Layout>
</template>

<script>
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";
import DataStatCard from "@/components/card/dataStatCard.vue";
import SuggestionCard from "@/views/page_1/page_1_1/components/suggestion-card.vue";
import ProductionResourceItem from "@/views/page_2/page_2_1/components/production-resource-item.vue";
import DataCard from "@/components/card/data-card.vue";
import SafetyRectifyChart from "@/views/page_2/page_2_1/components/safety-rectify-chart.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";

import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_1",
  components: {
    Layout,
    Box,
    DataStatCard,
    SuggestionCard,
    ProductionResourceItem,
    DataCard,
    SafetyRectifyChart,
    LeftToolbar,
  },
  mixins: [wdpapi],
  data() {
    return {
      leftTools: [
        {
          id: "1",
          label: "人员",
          icon: require("@/assets/images/page_2_1/人员-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/人员-选中.png"),
          isActive: false,
        },
        {
          id: "2",
          label: "区域",
          icon: require("@/assets/images/page_2_1/区域-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/区域-选中.png"),
          isActive: false,
        },
        {
          id: "3",
          label: "环境",
          icon: require("@/assets/images/page_2_1/环境-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/环境-选中.png"),
          isActive: false,
        },
        {
          id: "4",
          label: "岗亭",
          icon: require("@/assets/images/page_2_1/岗亭-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/岗亭-选中.png"),
          isActive: false,
        },
        {
          id: "5",
          label: "摄像头",
          icon: require("@/assets/images/page_2_1/摄像头-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/摄像头-选中.png"),
          isActive: false,
        },
        {
          id: "6",
          label: "巡检",
          icon: require("@/assets/images/page_2_1/巡检-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/巡检-选中.png"),
          isActive: false,
        },
        // {
        //   id: "7",
        //   label: "车间",
        //   icon: require("@/assets/images/page_2_1/车间-默认.png"),
        //   activeIcon: require("@/assets/images/page_2_1/车间-选中.png"),
        //   isActive: false,
        // },
      ],
      statCards: [
        {
          title: "实到人数",
          icon: require("@/assets/images/page_2_1/sdrs.png"),
          value: 832,
          unit: "人",
        },
        {
          title: "本厂设备",
          icon: require("@/assets/images/page_2_1/bcsb.png"),
          value: 84,
          unit: "台",
        },
        {
          title: "日计划",
          icon: require("@/assets/images/page_2_1/rjh.png"),
          value: 8,
          unit: "台/日",
        },
        {
          title: "工厂 OEE",
          icon: require("@/assets/images/page_2_1/gcoee.png"),
          value: 88,
          unit: "%",
        },
      ],
      productionResourceList: [
        {
          centerLabel: "人员",
          centerIcon: require("@/assets/images/page_2_1/人员.png"),
          left: {
            label: "到岗",
            icon: require("@/assets/images/page_2_1/到岗.png"),
            value: 832,
            unit: "人",
            danger: false,
          },
          right: {
            label: "空缺/其他",
            icon: require("@/assets/images/page_2_1/空缺.png"),
            value: 12,
            unit: "人",
            danger: true,
          },
        },
        {
          centerLabel: "设备",
          centerIcon: require("@/assets/images/page_2_1/设备.png"),
          left: {
            label: "正常",
            icon: require("@/assets/images/page_2_1/正常.png"),
            value: 80,
            unit: "台",
            danger: false,
          },
          right: {
            label: "故障",
            icon: require("@/assets/images/page_2_1/故障.png"),
            value: 3,
            unit: "台",
            danger: true,
          },
        },
      ],
      envDataList: [
        {
          iconPath: require("@/assets/images/page_2_1/环境温度.png"),
          label: "环境温度",
          value: 34,
          unit: "℃",
        },
        {
          iconPath: require("@/assets/images/page_2_1/环境湿度.png"),
          label: "环境湿度",
          value: 60,
          unit: "%RH",
        },
        {
          iconPath: require("@/assets/images/page_2_1/AQI.png"),
          label: "AQI",
          value: 54,
          unit: "ppm",
        },
        {
          iconPath: require("@/assets/images/page_2_1/PM2.5.png"),
          label: "PM2.5",
          value: 27,
          unit: "μg/m³",
        },
      ],
      safetyChartData: [
        { name: "已闭环", value: 2.8 },
        { name: "整改中", value: 1.4 },
        { name: "其他", value: 0.8 },
      ],
      suggestionList: [
        {
          label: "生产",
          content: "总装B线换型与物料延迟，MG750 优先、调整排产",
        },
        {
          label: "设备",
          content: "CNC#5 恢复后预防性检查；CNC#2 箱体线瓶颈评估产能",
        },
        {
          label: "人员",
          content: "夜班编程与焊证复审保障",
        },
        {
          label: "质量",
          content: "焊接气孔/咬边、机加精镗双线改善",
        },
        {
          label: "环境",
          content: "试验峰谷转移、空压泄漏治理",
        },
        {
          label: "仓储",
          content: "盘库与低周转处置",
        },
        {
          label: "安防",
          content: "隐患整改跟踪与演练",
        },
      ],
    };
  },
  computed: {},
  async mounted() {},

  methods: {
    async handleToolSelect(selectedItem) {
      const toolId = Number(selectedItem.id);

      if (typeof this.closeAll === "function") {
        await this.closeAll();
      }

      if (!selectedItem.isActive) return;

      const handler = this.toolHandlers?.[toolId];
      const data = this.toolData?.[toolId];
      if (typeof handler === "function") {
        await handler(data, toolId);
      }
    },
    goToWorkshop() {
      this.$router.push("/page_2/1-workshop");
    },
  },

  async beforeDestroy() {},
};
</script>
