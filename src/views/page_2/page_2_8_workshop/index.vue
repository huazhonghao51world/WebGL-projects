<template>
  <Layout :aside="true" :main="true">

    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">

        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>应急安防</h1>
          </template>
          <div class="box-main-content">
            <div class="car-bon-card">
              <CarbonCard v-for="(item, index) in carbonMonitorData" :key="index" :title="item.title"
                :value="item.value" :unit="item.unit" :icon="item.icon" />
            </div>
            <SecBox class="sec1">
              <template v-slot:header>
                <span class="sec-title">各类风险统计</span>
              </template>
              <PeriodTabs class="period-tabs" v-model="tabPeriod"
                :tabs="[{ label: '日', key: 'day' }, { label: '月', key: 'month' }, { label: '年', key: 'year' }]" />
              <div class="charts-wrap">
                <!-- 上方：风险占比饼图 -->
                <RiskPie
                  :data="currentPieData"
                  :colors="riskColors"
                  :bgImage="pieBgImage"
                  ratio="1/1"
                />
                <!-- 下方：风险趋势折线图 -->
                <RiskChart :chartData="currentChartData" :yAxisMax="currentYAxisMax" :yAxisInterval="currentYAxisInterval" />
              </div>
            </SecBox>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>监控摄像头列表</h1>
          </template>
          <div class="box-main-content">
            <div class="table-wrap">
              <WorkshopTable
                :columns="cameraColumns"
                :tableData="cameraData"
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
            <h1>应急安防-车间数据3</h1>
          </template>
          <div class="box-main-content">

          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>应急安防-车间数据4</h1>
          </template>
          <div class="box-main-content">

          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="right">
          <template v-slot:header>
            <h1>应急安防-车间数据4</h1>
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
import PeriodTabs from "@/components/periodTabs.vue";
import RiskPie from "@/views/page_2/page_2_8/components/risk-pie.vue";
import RiskChart from "@/views/page_2/page_2_8/components/risk-chart.vue";
import WorkshopTable from "@/components/table/workshopTable.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_8_Workshop",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    SecBox,
    CarbonCard,
    LeftToolbar,
    PeriodTabs,
    RiskPie,
    RiskChart,
    WorkshopTable,
  },
  data() {
    return {
      leftTools: [
        {
          id: "1",
          label: "风险点位",
          icon: require("@/assets/images/page_2_8/风险点位-默认.png"),
          activeIcon: require("@/assets/images/page_2_8/风险点位-选中.png"),
          isActive: false,
        },
        {
          id: "2",
          label: "摄像头",
          icon: require("@/assets/images/page_2_8/摄像头-默认.png"),
          activeIcon: require("@/assets/images/page_2_8/摄像头-选中.png"),
          isActive: false,
        }
      ],
      tabPeriod: 'month',
      pieBgImage: require('@/assets/images/page_2_8/pie_bg.png'),
      riskColors: ['#4FC3F7', '#0FDACB', '#FFD051', '#FF6D6D'],
      // 各周期饼图数据
      pieDataMap: {
        day: [
          { name: '消防安全', value: 6 },
          { name: '电气隐患', value: 5 },
          { name: '机械伤害', value: 4 },
          { name: '违章行为', value: 2 },
        ],
        month: [
          { name: '消防安全', value: 32 },
          { name: '电气隐患', value: 27 },
          { name: '机械伤害', value: 25 },
          { name: '违章行为', value: 16 },
        ],
        year: [
          { name: '消防安全', value: 96 },
          { name: '电气隐患', value: 81 },
          { name: '机械伤害', value: 75 },
          { name: '违章行为', value: 48 },
        ],
      },
      // 各周期折线图数据
      chartDataMap: {
        day: {
          xData: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          yData: [
            { name: '消防安全', data: [1, 1, 2, 2, 3, 2, 1], color: '#4FC3F7' },
            { name: '电气隐患', data: [1, 1, 1, 2, 2, 1, 1], color: '#0FDACB' },
            { name: '机械伤害', data: [0, 1, 1, 1, 1, 1, 1], color: '#FFD051' },
            { name: '违章行为', data: [0, 0, 1, 1, 0, 1, 0], color: '#FF6D6D' },
          ],
        },
        month: {
          xData: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          yData: [
            { name: '消防安全', data: [3, 2, 4, 4, 3, 4, 4, 3, 4, 3, 4, 3], color: '#4FC3F7' },
            { name: '电气隐患', data: [2, 1, 2, 3, 2, 2, 3, 2, 3, 2, 2, 2], color: '#0FDACB' },
            { name: '机械伤害', data: [2, 2, 1, 2, 2, 2, 3, 2, 3, 2, 3, 2], color: '#FFD051' },
            { name: '违章行为', data: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1], color: '#FF6D6D' },
          ],
        },
        year: {
          xData: ['2019', '2020', '2021', '2022', '2023', '2024'],
          yData: [
            { name: '消防安全', data: [28, 32, 26, 36, 30, 34], color: '#4FC3F7' },
            { name: '电气隐患', data: [20, 24, 22, 26, 25, 28], color: '#0FDACB' },
            { name: '机械伤害', data: [18, 20, 16, 22, 20, 24], color: '#FFD051' },
            { name: '违章行为', data: [12, 14, 10, 16, 13, 15], color: '#FF6D6D' },
          ],
        },
      },
      // 表格2：监控摄像头列表
      cameraColumns: [
        { key: 'id', label: '编号', flex: 1, type: 'common', style: (row, index) => ({ color: index < 3 ? '#9BF8FF' : '#C0D0D5', fontFamily: 'var(--font-family-primary-Bold)' }) },
        { key: 'area', label: '区域', flex: 1.5 },
        { key: 'status', label: '状态', flex: 1, type: 'status-dot', statusMap: { '在线': 'primary', '离线': 'info' } },
      ],
      cameraData: [
        { id: 'CAM-01', area: '机加车间入口', status: '在线' },
        { id: 'CAM-02', area: '滚筒线精镗位', status: '在线' },
        { id: 'CAM-03', area: '箱体线', status: '在线' },
        { id: 'CAM-04', area: '装配区', status: '离线' },
        { id: 'CAM-04', area: '装配区', status: '离线' },
        { id: 'CAM-05', area: '箱体线', status: '离线' },
        { id: 'CAM-06', area: '箱体线', status: '离线' },
        { id: 'CAM-07', area: '箱体线', status: '离线' },
        { id: 'CAM-08', area: '箱体线', status: '离线' },
        { id: 'CAM-09', area: '箱体线', status: '离线' },
        { id: 'CAM-10', area: '箱体线', status: '离线' },
        { id: 'CAM-11', area: '箱体线', status: '离线' },
        { id: 'CAM-12', area: '箱体线', status: '离线' },
        { id: 'CAM-13', area: '箱体线', status: '离线' },
      ],
      carbonMonitorData: [
        { title: '累计无事故天数', value: '156', unit: '天', icon: require('@/assets/images/page_2_8/累计无事故天数.png') },
      ],
    };
  },
  mounted() {

  },
  computed: {
    currentPieData() {
      return this.pieDataMap[this.tabPeriod] || this.pieDataMap.month;
    },
    currentChartData() {
      return this.chartDataMap[this.tabPeriod] || this.chartDataMap.month;
    },
    currentYAxisMax() {
      return this.tabPeriod === 'year' ? null : 10;
    },
    currentYAxisInterval() {
      return this.tabPeriod === 'year' ? null : 2;
    },
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
    goToDevice() {
      this.$router.push({ path: '/page_2/8-device', query: { from: 'workshop' } });
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
    height: 62.3%;
  }

  .box2 {
    height: 30.2%;
  }
}

.content-right {
  .box1 {
    height: 32.6%;
  }

  .box2 {
    height: 20.8%;
  }

  .box3 {
    height: 20.8%;
  }
}

.car-bon-card {
  padding: 0.7rem 0.5rem 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.3rem;
}

.period-tabs {
  margin-top: 0.7rem;
}

.charts-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
  padding: 0.6rem 0.3rem 1.3rem;
}

.table-wrap {
  width: 100%;
  height: 100%;
  padding: 0 0.3rem;
  box-sizing: border-box;
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