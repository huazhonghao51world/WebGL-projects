<template>
  <Layout :aside="true" :main="true">
    <template v-slot:aside-left-tools>
      <div class="toolbar-legend-wrapper">
        <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
        <img
          v-if="activeToolId === '1'"
          class="noise-legend"
          src="@/assets/images/page_2_7/图例.png"
          alt="图例"
        />
      </div>
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>各区域噪声统计</h1>
          </template>
          <div class="box-main-content">
            <div class="unit-text">单位: DB(A)</div>
            <div class="chart-wrapper">
              <SafetyRectifyChart
                :chartData="noiseData"
                :max="100"
                :interval="20"
                color="#4F8AF2"
              />
            </div>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>粉尘浓度</h1>
          </template>
          <div class="box-main-content">
            <div class="unit-text">单位: µg/m³</div>
            <div class="gauge-wrapper">
              <DustGaugePanel :pm25Value="28" :pm10Value="42" />
            </div>
          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>温湿度趋势</h1>
          </template>
          <div class="box-main-content">
            <div class="chart-wrapper-3">
              <TempHumidityChart />
            </div>
          </div>
        </Box>

        <Box class="box4" :delayTime="350" position="left">
          <template v-slot:header>
            <h1>VOCs 与照度</h1>
          </template>
          <div class="box-main-content">
            <div class="car-bon-card">
              <CarbonCard
                v-for="(item, index) in carbonMonitorData"
                :key="index"
                :title="item.title"
                :value="item.value"
                :unit="item.unit"
                :icon="item.icon"
              />
            </div>
            <div class="unit-text">单位: lx</div>
            <div class="chart-wrapper-2">
              <SafetyRectifyChart
                :chartData="illuminationData"
                :max="500"
                :interval="100"
                color="#7CF5F8"
              />
            </div>
          </div>
        </Box>
      </div>
    </template>

    <!-- <div class="action-buttons">
      <div class="action-btn disabled">
        <span>车间</span>
      </div>
      <div class="action-btn disabled">
        <span>仓库</span>
      </div> -->
    <!-- <div class="action-btn" @click="goToDevice"> -->
    <!-- <div class="action-btn disabled">
        <span>设备</span>
      </div>
    </div> -->

    <!-- <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>环境管理-车间数据3</h1>
          </template>
          <div class="box-main-content">

          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>环境管理-车间数据4</h1>
          </template>
          <div class="box-main-content">

          </div>
        </Box>
      </div>
    </template> -->
  </Layout>
</template>

<script>
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";
import CarbonCard from "@/components/card/carbonCard.vue";
import SafetyRectifyChart from "./components/safety-rectify-chart.vue";
import DustGaugePanel from "./components/dust-gauge-panel.vue";
import TempHumidityChart from "./components/temp-humidity-chart.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_7_Workshop",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    CarbonCard,
    SafetyRectifyChart,
    DustGaugePanel,
    TempHumidityChart,
    LeftToolbar,
  },
  data() {
    return {
      activeToolId: null,
      leftTools: [
        {
          id: "1",
          label: "噪声",
          icon: require("@/assets/images/page_2_7/噪声-默认.png"),
          activeIcon: require("@/assets/images/page_2_7/噪声-选中.png"),
          isActive: false,
        },
        {
          id: "2",
          label: "环境传感器",
          icon: require("@/assets/images/page_2_7/环境传感器-默认.png"),
          activeIcon: require("@/assets/images/page_2_7/环境传感器-选中.png"),
          isActive: false,
        },
      ],
      carbonMonitorData: [
        {
          title: "VOCs 浓度",
          value: "0.35",
          unit: "mg/m³",
          icon: require("@/assets/images/page_2_7/VOCs浓度.png"),
        },
      ],
      noiseData: [
        { name: "机加区", value: 75 },
        { name: "总装区", value: 38 },
        { name: "通道", value: 28 },
      ],
      illuminationData: [
        { name: "机加区", value: 260 },
        { name: "焊接区", value: 210 },
        { name: "装配线", value: 260 },
        { name: "检验区", value: 410 },
      ],
    };
  },
  mounted() {},
  computed: {},
  async beforeDestroy() {},
  methods: {
    async handleToolSelect(selectedItem) {
      const toolId = Number(selectedItem.id);
      this.activeToolId = selectedItem.isActive ? selectedItem.id : null;

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
    goToDevice() {
      this.$router.push({
        path: "/page_2/7-device",
        query: { from: "workshop" },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.unit-text {
  font-size: var(--font-size-12);
  font-family: var(--font-family-primary-Regular);
  color: rgba(219, 245, 255, 0.8);
  padding: 0 0 0rem 1rem;
}

.chart-wrapper {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.chart-wrapper-2 {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.chart-wrapper-3 {
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 0.5rem 0.5rem 0 0.5rem;
}

.gauge-wrapper {
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 0.2rem 0;
}

.car-bon-card {
  padding: 0.3rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
}

.content-left {
  .box1 {
    height: 18%;
  }

  .box2 {
    height: 17.7%;
  }

  .box3 {
    height: 19.4%;
  }

  .box4 {
    height: 27.6%;
  }
}

.toolbar-legend-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.noise-legend {
  position: absolute;
  left: 130% !important; 
  top: 0;
  height: 2rem;
  aspect-ratio: 238 / 32;
  object-fit: contain;
  margin-left: 0.3rem;
  pointer-events: none;
}

.content-right {
  .box-item {
    height: 48%;
    margin-bottom: 4%;
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

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
</style>
