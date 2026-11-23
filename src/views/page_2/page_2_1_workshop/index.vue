<template>
  <Layout :aside="true">

    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box-item box-1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>综合看板</h1>
          </template>
          <div class="box-main-content">
            <div class="stat-cards-grid">
              <DataStatCard v-for="item in statCards" :key="item.title" :title="item.title" :icon="item.icon"
                :value="item.value" :unit="item.unit" />
            </div>
          </div>
        </Box>

        <Box class="box-item box-2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>人员</h1>
          </template>
          <div class="box-main-content">
            <PersonnelPie
              :data="personnelGroupData"
              :bgImage="require('@/assets/images/page_2_1/pie_bg.png')"
              :centerIcon="require('@/assets/images/page_2_1/人员.png')"
              ratio="16/7"
            />
          </div>
        </Box>

        <Box class="box-item box-3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>质量</h1>
          </template>
          <div class="box-main-content">
            <QualityGaugePanel :valueMap="qualityGaugeValueMap" />
          </div>
        </Box>

        <Box class="box-item box-4" :delayTime="400" position="left">
          <template v-slot:header>
            <h1>安防</h1>
          </template>
          <div class="box-main-content">
            <SafetyModule :chartData="safetyChartData" :max="50" :interval="10" color="#9BF8FF" />
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
              <SuggestionCard v-for="(item, index) in suggestionList" :key="index" :label="item.label"
                :content="item.content" :aspectRatio="'324/56'" />
            </div>
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
import QualityGaugePanel from "@/views/page_2/page_2_1_workshop/components/quality-gauge-panel.vue";
import SafetyModule from "@/views/page_2/page_2_1_workshop/components/safety-module.vue";
import PersonnelPie from "@/views/page_2/page_2_1_workshop/components/personnel-pie.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_1_Workshop",
  components: {
    Layout,
    Box,
    DataStatCard,
    SuggestionCard,
    ProductionResourceItem,
    QualityGaugePanel,
    SafetyModule,
    PersonnelPie,
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
          label: "设备",
          icon: require("@/assets/images/page_2_1/设备-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/设备-选中.png"),
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
          label: "摄像头",
          icon: require("@/assets/images/page_2_1/摄像头-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/摄像头-选中.png"),
          isActive: false,
        },
        {
          id: "5",
          label: "工位",
          icon: require("@/assets/images/page_2_1/工位-默认.png"),
          activeIcon: require("@/assets/images/page_2_1/工位-选中.png"),
          isActive: false,
        },
      ],
      statCards: [
        {
          title: "在岗人数",
          icon: require("@/assets/images/page_2_1/zgrs.png"),
          value: 186,
          unit: "人",
        },
        {
          title: "车间设备",
          icon: require("@/assets/images/page_2_1/cjsb.png"),
          value: 24,
          unit: "台",
        },
        {
          title: "WIP",
          icon: require("@/assets/images/page_2_1/wip.png"),
          value: 26,
          unit: "件",
        },
        {
          title: "节拍达成",
          icon: require("@/assets/images/page_2_1/jpdc.png"),
          value: 96,
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
      personnelGroupData: [
        { name: "一组", value: 10, leader: "张XX", count: 19 },
        { name: "二组", value: 30, leader: "梁XX", count: 56 },
        { name: "三组", value: 25, leader: "王XX", count: 47 },
        { name: "四组", value: 35, leader: "李XX", count: 64 },
      ],
      safetyChartData: [
        { name: "焊接区", value: 20 },
        { name: "起吊区", value: 45 },
        { name: "其他", value: 18 },
      ],
      personnelChartData: [
        { name: "到岗", value: 832 },
        { name: "空缺/其他", value: 12 },
      ],
      qualityGaugeValueMap: {
        year: 48.2,
        month: 56.7,
        day: 63.5,
      },
      suggestionList: [
        {
          label: "生产",
          content: "精镗工序拥堵，可分流或加班；CNC#5恢复后箱体清尾",
        },
        {
          label: "设备",
          content: "CNC #2 换型 16:00 备料与程序确认",
        },
        {
          label: "人员",
          content: "B1班疲劳度与轮换、关键岗位补缺",
        },
        {
          label: "质量",
          content: "箱体孔精镗与动平衡首件与SPC严格执行",
        },
        {
          label: "环境",
          content: "焊接区通风与高温轮班",
        },
        {
          label: "仓储",
          content: "液压站组件、滚筒铸件线边补料与AGV调配",
        },
        {
          label: "安防",
          content: "高风险区域隔离与监控联动",
        },
      ],
    };
  },
  computed: {},
  async mounted() { },
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
  },
  async beforeDestroy() { },
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
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

.suggestions-container {
  flex: 1;
  overflow-y: auto;
  // padding-right: 0.5rem;

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

.content-left {
  .box-1 {
    height: 20%;
  }

  .box-2 {
    height: 21.2%;

    .box-main-content {
      padding: 0.5rem;
    }
  }

  .box-3 {
    height: 21.5%;
  }

  .box-4 {
    height: 20%;
  }
}

.content-right {
  .box-item {
    height: 48%;
    margin-bottom: 4%;
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
    background: linear-gradient(135deg,
        rgba(139, 116, 88, 0.6),
        rgba(139, 116, 88, 0.3));
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
      background: linear-gradient(135deg,
          rgba(139, 116, 88, 0.8),
          rgba(139, 116, 88, 0.5));
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
</style>
