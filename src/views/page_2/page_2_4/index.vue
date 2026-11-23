<template>
  <Layout :aside="true" :main="true">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>产品清单总览</h1>
          </template>
          <div class="box-main-content">
            <div class="stat-cards-grid">
              <DataStatCard v-for="item in statCards" :key="item.title" :title="item.title" :icon="item.icon"
                :value="item.value" :unit="item.unit" />
            </div>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>各类采煤机产量及比例</h1>
          </template>
          <div class="box-main-content">
            <div class="card-list-container">
              <DiagnosisCard v-for="(item, index) in productionList" :key="'prod-' + index" :title="item.title"
                :subTitle="item.subTitle">
                <template v-slot:content>
                  <div class="custom-card-content">
                    <span class="info-text" style="flex: 1;">在役: <span class="val">{{ item.zaiyi }}</span> 台</span>
                    <span class="divider">|</span>
                    <span class="info-text" style="flex: 1;">占比: <span class="val">{{ item.rate }}</span> %</span>
                    <span class="divider">|</span>
                    <span class="info-text" style="flex: 2;">说明: <span class="desc-val">{{ item.desc }}</span></span>
                  </div>
                </template>
              </DiagnosisCard>
            </div>
          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>产品列表</h1>
          </template>
          <div class="box-main-content">
            <div class="card-list-container">
              <DiagnosisCard v-for="(item, index) in productList" :key="'item-' + index" :title="item.title"
                :orderNo="item.orderNo">
                <template v-slot:content>
                  <div class="custom-card-content justify-between">
                    <span class="info-text">{{ item.clientKey }}<span class="desc-val">{{ item.clientVal1
                        }}</span></span>
                    <span class="info-text"><span class="desc-val">{{ item.clientVal2 }}</span></span>
                  </div>
                </template>
              </DiagnosisCard>
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
      </div>
      <div class="action-btn" @click="goToDevice">
        <span>零件</span>
      </div>
    </div> -->

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>交付设备整体运行状态比例</h1>
          </template>
          <div class="box-main-content">
            <DeviceStatusChart :statusData="deviceStatusData" />
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>故障趋势</h1>
          </template>
          <div class="box-main-content">

            <!-- 这里封装折线图 -->
            <div class="chart-wrapper">
              <FaultTrendChart :chartData="chartData" />
            </div>

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">主要问题清单</span>
              </template>

              <!-- 这里复用表格 -->
              <div class="table-wrapper">
                <WorkshopTable :columns="tableColumns" :tableData="tableData" headerColor="#9BF8FF" rowBg="rgba(224, 233, 233, 0.1)" :addGap="true"/>
              </div>

              <div class="sec3-custom">
                <div class="cyan-title">改进建议</div>
                <div class="text-content">
                  液压与电气类问题通过密封与接线规范已见成效；截齿磨损建议按吨煤量周期更换；滚筒轴承异响需加强润滑与振动监测。
                </div>
              </div>
            </SecBox>
          </div>
        </Box>
      </div>
    </template>

    <!-- 煤矿01：放入左下角工具插槽，定位方式与左侧工具按钮一致 -->
    <template v-slot:aside-left-tools>
      <div class="mine-entry-btn" @click="goMine" title="煤矿01">
        <div class="toolbar-icon">
          <img :src="mineIcon" alt="煤矿01" />
        </div>
      </div>
    </template>
  </Layout>
</template>

<script>
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";
import DataStatCard from "@/components/card/dataStatCard.vue";
import DiagnosisCard from "@/components/card/diagnosisCard.vue";
import SecBox from "@/components/secBox.vue";
import FaultTrendChart from "./components/fault-trend-chart.vue";
import WorkshopTable from "@/components/table/workshopTable.vue";
import DeviceStatusChart from "./components/device-status-chart.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_4",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    DataStatCard,
    DiagnosisCard,
    SecBox,
    FaultTrendChart,
    WorkshopTable,
    DeviceStatusChart
  },
  data() {
    return {
      mineIcon: require('@/assets/images/机器狗&煤矿.png'),
      statCards: [
        { title: '总产品量', icon: require('@/assets/images/page_2_4/总产品量.png'), value: '128', unit: '' },
        { title: 'MG750系列', icon: require('@/assets/images/page_2_4/MG750系列.png'), value: '72', unit: '' },
        { title: 'MG500系列', icon: require('@/assets/images/page_2_4/MG500系列.png'), value: '38', unit: '' },
        { title: 'MG400系列', icon: require('@/assets/images/page_2_4/MG400系列.png'), value: '18', unit: '' },
      ],
      productionList: [
        { title: 'MG750/1915-WD', subTitle: '(大采高)', zaiyi: '72', rate: '56', desc: '主力机型，厚煤层' },
        { title: 'MG500/1130-WD', subTitle: '(中厚煤层)', zaiyi: '38', rate: '30', desc: '中厚煤层主力' },
        { title: 'MG400/930-WD', subTitle: '(薄煤层/出口)', zaiyi: '18', rate: '14', desc: '薄煤层及海外' },
      ],
      productList: [
        { title: 'MG750/1915-WD', orderNo: 'SO-202502-001', clientKey: '客户: ', clientVal1: '华北矿业集团', clientVal2: '大同某矿' },
        { title: 'MG750/1921-WD', orderNo: 'SO-202502-002', clientKey: '客户: ', clientVal1: '西北能源', clientVal2: '鄂尔多斯某矿' },
        { title: 'MG750/1130-WD', orderNo: 'SO-202501-008', clientKey: '客户: ', clientVal1: '中原煤业', clientVal2: '平顶山某矿' },
        { title: 'MG750/1918-WD', orderNo: 'SO-202501-005', clientKey: '客户: ', clientVal1: '陕煤集团', clientVal2: '榆林某矿' }
      ],
      chartData: {
        xData: ['2024-11', '2024-12', '2025-01', '2025-02'],
        yData: [
          {
            name: '故障次数',
            data: [17, 22, 15, 12]
          }
        ]
      },
      tableColumns: [
        { label: '问题类型', key: 'type', flex: 2.0, style: "color: #FFFFFF; font-size: var(--font-size-12);" },
        { label: '发生次数', key: 'count', flex: 1, style: "color: #DBF5FF; font-size: var(--font-size-16); font-family: var(--font-family-number);" },
        { label: '趋势', key: 'trend', flex: 1, type: 'trend' }
      ],
      deviceStatusData: [
        { label: '运行', value: 87, total: 120, color: '#00E5C8', bg: require('@/assets/images/page_2_4/running_bg.png') },
        { label: '检修', value: 26, total: 120, color: '#F5C518', bg: require('@/assets/images/page_2_4/overhaul_bg.png') },
        { label: '停机', value: 7,  total: 120, color: '#FF4D4D', bg: require('@/assets/images/page_2_4/shutdown_bg.png') },
      ],
      tableData: [
        { type: '液压系统渗漏/密封失效', count: 28, trend: '下降' },
        { type: '截齿磨损导致割煤效率下降', count: 19, trend: '持平' },
        { type: '电气接线/传感器故障', count: 14, trend: '下降' },
        { type: '滚筒轴承异响', count: 8, trend: '关注' },
        { type: '密封失效', count: 36, trend: '上升' }
      ]
    };
  },
  computed: {

  },
  async mounted() {

  },

  methods: {
    goToDevice() {
      this.$router.push({ path: '/page_2/4-device', query: { from: 'factory' } });
    },
    goMine() {
      // 跳转地址按环境区分：本地 .env.development，部署 .env.production（VUE_APP_MINE_URL）
      const url = process.env.VUE_APP_MINE_URL || `${window.location.origin}/minesimeval/`;
      window.location.href = url;
    },
  },

  async beforeDestroy() {

  },
};
</script>

<style lang="scss" scoped>
/* 煤矿01 入口，定位由 Layout 的 aside-left-tools 插槽提供，样式与左侧工具按钮（LeftToolbar）一致 */
.mine-entry-btn {
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
  transition: all 0.2s ease;

  .toolbar-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      opacity: 0.75;
      object-fit: cover;
      max-width: 100%;
      max-height: 100%;
    }
  }

  &:hover .toolbar-icon img {
    opacity: 0.9;
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

.sec3-custom {
  // margin-top: 0rem;
  padding: 1.5rem 0.2rem 0;

  .cyan-title {
    color: #9BF8FF;
    font-size: var(--font-size-12);
    margin-bottom: 0.5rem;
    font-family: var(--font-family-primary-Medium);
  }

  .text-content {
    font-size: var(--font-size-12);
    line-height: var(--font-size-20);
    color: rgba(255, 255, 255, 1);
    font-family: var(--font-family-primary-Regular);
  }
}

.box-main-content {
  height: 100%;
  width: 100%;
}

.content-left {
  .box1 {
    height: 21%;
  }

  .box2 {
    height: 30%;
  }

  .box3 {
    height: 36.5%;
  }
}

.content-right {
  .box1 {
    height: 18.2%;
  }

  .box2 {
    height: 74.5%;
    .table-wrapper {
      margin-top: 1rem;
    }
  }

}

.card-list-container {
  padding: 0.2rem 0.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: calc(100% - 0.5rem);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #63768D;
    border-radius: 3px;

    &:hover {
      background: #748292;
    }
  }
}

.chart-wrapper {
  // height: 30%;
  width: 100%;
  margin-bottom: 2rem;
}

.custom-card-content {
  display: flex;
  align-items: baseline;
  width: 100%;

  &.justify-between {
    justify-content: space-between;
  }

  .info-text {
    color: #CAD0D8;
    font-size: var(--font-size-12);
  }

  .info-val {
    color: #ffffff;
    font-size: var(--font-size-12);
  }

  .val {
    color: #EBF6FF;
    font-size: var(--font-size-16);
    font-family: var(--font-family-number);
    margin: 0 0.2rem;
  }

  .desc-val {
    color: #FFFFFF;
    font-size: var(--font-size-12);
    margin: 0 0.2rem;
  }

  .divider {
    color: rgba(255, 255, 255, 0.2);
    margin: 0 0.4rem;
    font-size: var(--font-size-12);
  }
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
