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

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">风险事件记录列表</span>
              </template>
              <div class="table-wrap">
                <WorkshopTable
                  :columns="riskEventColumns"
                  :tableData="riskEventData"
                />
              </div>
            </SecBox>
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

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
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

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>岗亭信息</h1>
          </template>
          <div class="box-main-content">
            <div class="table-wrap">
              <WorkshopTable
                :columns="boothColumns"
                :tableData="boothData"
              />
            </div>
          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="right">
          <template v-slot:header>
            <h1>巡检设备信息</h1>
          </template>
          <div class="box-main-content">
            <div class="patrol-resource-list">
              <ProductionResourceItem
                v-for="(item, index) in patrolResourceList"
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
            <div class="table-wrap table4">
              <WorkshopTable
                :columns="patrolColumns"
                :tableData="patrolData"
              />
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
import SecBox from "@/components/secBox.vue";
import CarbonCard from "@/components/card/carbonCard.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import PeriodTabs from "@/components/periodTabs.vue";
import RiskPie from "./components/risk-pie.vue";
import RiskChart from "./components/risk-chart.vue";
import WorkshopTable from "@/components/table/workshopTable.vue";
import ProductionResourceItem from "./components/production-resource-item.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_8",
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
    ProductionResourceItem,
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
        },
        {
          id: "3",
          label: "岗亭",
          icon: require("@/assets/images/page_2_8/岗亭-默认.png"),
          activeIcon: require("@/assets/images/page_2_8/岗亭-选中.png"),
          isActive: false,
        },
        {
          id: "4",
          label: "巡检",
          icon: require("@/assets/images/page_2_8/巡检-默认.png"),
          activeIcon: require("@/assets/images/page_2_8/巡检-选中.png"),
          isActive: false,
        },
      ],
      tabPeriod: 'month',
      pieBgImage: require('@/assets/images/page_2_8/pie_bg.png'),
      riskColors: ['#4FC3F7', '#0FDACB', '#FFD051', '#FF6D6D'],
      // 各周期饼图数据
      pieDataMap: {
        day: [
          { name: '消防安全', value: 8 },
          { name: '电气隐患', value: 6 },
          { name: '机械伤害', value: 5 },
          { name: '违章行为', value: 3 },
        ],
        month: [
          { name: '消防安全', value: 32 },
          { name: '电气隐患', value: 27 },
          { name: '机械伤害', value: 25 },
          { name: '违章行为', value: 16 },
        ],
        year: [
          { name: '消防安全', value: 128 },
          { name: '电气隐患', value: 108 },
          { name: '机械伤害', value: 100 },
          { name: '违章行为', value: 64 },
        ],
      },
      // 各周期折线图数据
      chartDataMap: {
        day: {
          xData: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          yData: [
            { name: '消防安全', data: [2, 1, 3, 2, 4, 3, 2], color: '#4FC3F7' },
            { name: '电气隐患', data: [1, 2, 1, 3, 2, 1, 2], color: '#0FDACB' },
            { name: '机械伤害', data: [0, 1, 2, 1, 1, 2, 1], color: '#FFD051' },
            { name: '违章行为', data: [1, 0, 1, 1, 0, 1, 1], color: '#FF6D6D' },
          ],
        },
        month: {
          xData: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          yData: [
            { name: '消防安全', data: [4, 3, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4], color: '#4FC3F7' },
            { name: '电气隐患', data: [2, 1, 3, 3, 2, 3, 3, 3, 3, 2, 3, 2], color: '#0FDACB' },
            { name: '机械伤害', data: [3, 2, 1, 2, 3, 3, 4, 3, 4, 3, 4, 3], color: '#FFD051' },
            { name: '违章行为', data: [2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1], color: '#FF6D6D' },
          ],
        },
        year: {
          xData: ['2019', '2020', '2021', '2022', '2023', '2024'],
          yData: [
            { name: '消防安全', data: [38, 42, 35, 48, 40, 45], color: '#4FC3F7' },
            { name: '电气隐患', data: [28, 32, 30, 35, 33, 38], color: '#0FDACB' },
            { name: '机械伤害', data: [25, 28, 22, 30, 28, 32], color: '#FFD051' },
            { name: '违章行为', data: [18, 20, 15, 22, 18, 20], color: '#FF6D6D' },
          ],
        },
      },
      // 表格1：风险事件记录列表
      riskEventColumns: [
        { key: 'time', label: '时间', flex: 1.4 },
        { key: 'type', label: '类型', flex: 0.8 },
        { key: 'desc', label: '描述', flex: 2 },
        { key: 'status', label: '状态', flex: 1, type: 'status-dot', statusMap: { '已处理': 'primary', '处理中': 'warning', '未处理': 'danger' } },
      ],
      riskEventData: [
        { time: '02-28 09:00', type: '隐患', desc: '消防通道临时堆放', status: '已处理' },
        { time: '02-27 14:30', type: '事件', desc: '巡检完成-机加车间', status: '处理中' },
        { time: '02-26 11:00', type: '隐患', desc: '电气柜门未关', status: '已处理' },
        { time: '02-26 11:00', type: '隐患', desc: '电气柜门未关', status: '已处理' },
        { time: '02-27 14:30', type: '事件', desc: '巡检完成-机加车间', status: '未处理' },
      ],
      // 表格2：监控摄像头列表
      cameraColumns: [
        { key: 'id', label: '编号', flex: 1, type: 'common', style: (row, index) => ({ color: index < 3 ? '#9BF8FF' : '#C0D0D5', fontFamily: 'var(--font-family-primary-Bold)' }) },
        { key: 'area', label: '区域', flex: 1.5 },
        { key: 'status', label: '状态', flex: 1, type: 'status-dot', statusMap: { '在线': 'primary', '离线': 'info' } },
      ],
      cameraData: [
        { id: 'CAM-01', area: '机加车间入口', status: '在线', },
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
      // 表格3：岗亭信息
      boothColumns: [
        { key: 'name', label: '名称', flex: 1.2, type: 'common', style: { color: '#9BF8FF', fontFamily: 'var(--font-family-primary-Bold)' } },
        { key: 'guard', label: '值守人', flex: 1 },
        { key: 'contact', label: '联系方式', flex: 1.5 },
      ],
      boothData: [
        { name: '东门岗亭', guard: '张明明', contact: '138****1001' },
        { name: '西门岗亭', guard: '李华', contact: '130****1034' },
        { name: '生产区入口', guard: '王强', contact: '137****1003' },
      ],
      // 巡检设备资源卡片
      patrolResourceList: [
        {
          centerLabel: '机械狗',
          centerIcon: require('@/assets/images/page_2_8/机械狗.png'),
          left: {
            label: '运行',
            icon: require('@/assets/images/page_2_8/运行.png'),
            value: 3,
            unit: '台',
            danger: false,
          },
          right: {
            label: '离线',
            icon: require('@/assets/images/page_2_8/离线.png'),
            value: 1,
            unit: '台',
            danger: true,
          },
        },
        {
          centerLabel: '无人机',
          centerIcon: require('@/assets/images/page_2_8/无人机.png'),
          left: {
            label: '运行',
            icon: require('@/assets/images/page_2_8/运行.png'),
            value: 2,
            unit: '台',
            danger: false,
          },
          right: {
            label: '离线',
            icon: require('@/assets/images/page_2_8/离线.png'),
            value: 0,
            unit: '台',
            danger: true,
          },
        },
      ],
      // 表格4：巡检设备信息
      patrolColumns: [
        { key: 'time', label: '时间', flex: 1.4 },
        { key: 'device', label: '设备', flex: 1 },
        { key: 'route', label: '巡检路线', flex: 1.2 },
        { key: 'risk', label: '风险项', flex: 0.8 },
      ],
      patrolData: [
        { time: '02-28 08:00', device: '机械狗#2', route: '机加-总装', risk: '0' },
        { time: '02-28 07:30', device: '无人机#1', route: '厂区周界', risk: '1' },
      ],
      carbonMonitorData: [
        { title: '累计无事故天数', value: '428', unit: '天', icon: require('@/assets/images/page_2_8/累计无事故天数.png') },
      ],
    };
  },
  mounted() { },
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
    goToWorkshop() {
      this.$router.push('/page_2/8-workshop');
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
    height: 97.5%;
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
    height: 34%;

    .table4 {
      height: 45%;
      padding-top: 1.6rem;
    }
  }
}

.header-tool-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
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
  padding: 0.2rem 0.3rem;
  box-sizing: border-box;
}

.patrol-resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.3rem 0.6rem 0.5rem;
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
