<template>
  <Layout :aside="true" :main="true">

    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>环境指标</h1>
          </template>
          <div class="box-main-content">

            <div class="car-bon-card">
              <CarbonCard v-for="(item, index) in carbonMonitorData" :key="index" :title="item.title"
                :value="item.value" :unit="item.unit" :icon="item.icon" />
            </div>

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">洁净度达标率</span>
              </template>
              <div>
                <CleanlinessChart :chartData="chartData" />
              </div>
            </SecBox>

          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>各类有害气体监测状态</h1>
          </template>
          <div class="box-main-content gas-monitor-list">
            <GasMonitor v-for="(item, index) in gasList" :key="index" :titleTop="item.titleTop"
              :titleBottom="item.titleBottom" :value="item.value" :unit="item.unit" :points="item.points"
              :status="item.status" />
          </div>
        </Box>
      </div>
    </template>

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

    <!-- <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>环境管理-数据展示3</h1>
          </template>
          <div class="box-main-content">

          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>环境管理-数据展示4</h1>
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
import SecBox from "@/components/secBox.vue";
import CarbonCard from "@/components/card/carbonCard.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import CleanlinessChart from "./components/cleanliness-chart.vue";
import GasMonitor from "./components/gas-monitor.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_7",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    SecBox,
    CarbonCard,
    LeftToolbar,
    GasMonitor,
    CleanlinessChart,
  },
  data() {
    return {
      leftTools: [
        {
          id: "1",
          label: "环境传感器",
          icon: require("@/assets/images/page_2_7/环境传感器-默认.png"),
          activeIcon: require("@/assets/images/page_2_7/环境传感器-选中.png"),
          isActive: false,
        },
      ],
      carbonMonitorData: [
        { title: '温湿度/洁净度达标率', value: '98.5', unit: '%', icon: require('@/assets/images/page_2_7/废弃物合规处理率.png') },
        { title: '有害气体浓度', value: '12', unit: 'ppm', icon: require('@/assets/images/page_2_7/达标率.png') },
        { title: '废弃物合规处理率', value: '99.1', unit: '%', icon: require('@/assets/images/page_2_7/有害气体浓度.png') }
      ],
      gasList: [
        { titleTop: 'CO', titleBottom: '一氧化碳', value: 8, unit: '(ppm)', points: [0, 4, 30], status: '正常' },
        { titleTop: 'SO2', titleBottom: '二氧化硫', value: 0.02, unit: '(mg/m³)', points: [0, 0.05, 0.15, 0.5], status: '正常' },
        { titleTop: 'NOx', titleBottom: '氮氧化物', value: 0.08, unit: '(mg/m³)', points: [0, 0.05, 0.1, 0.2], status: '正常' },
        { titleTop: 'VOCs', titleBottom: '挥发性有机物', value: 0.15, unit: '(mg/m³)', points: [0, 0.6], status: '正常' },
        { titleTop: '粉尘', titleBottom: 'PM10', value: 42, unit: '(μg/m³)', points: [0, 50, 150], status: '正常' }
      ],
      chartData: {
        xData: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06'],
        yData: [
          { name: '级别', data: [5.2, 4.8, 3.1, 4.2, 2.8, 5.2] }
        ]
      },

    };
  },
  mounted() { },
  computed: {

  },
  async beforeDestroy() {

  },
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
      this.$router.push('/page_2/7-workshop');
    },
  }
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
}

.content-left {
  .box1 {
    height: 57%;
  }

  .box2 {
    height: 35.5%;

    .gas-monitor-list {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0.5rem 0;
    }
  }
}

.content-right {
  .box-item {
    height: 48%;
    margin-bottom: 4%;
  }
}

.car-bon-card {
  padding: 0.3rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.3rem;
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
    background: linear-gradient(135deg, rgba(45, 154, 222, 0.3), rgba(45, 154, 222, 0.1));
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
      background: linear-gradient(135deg, rgba(45, 154, 222, 0.5), rgba(45, 154, 222, 0.2));
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
      background: linear-gradient(135deg, rgba(100, 100, 100, 0.2), rgba(100, 100, 100, 0.1));
      border-color: rgba(150, 150, 150, 0.3);
    }
  }
}
</style>
