<template>
  <Layout :aside="true">
    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>生产信息与制造履历</h1>
          </template>
          <div class="box-main-content">
            <div class="info-cards-container">
              <DataCard v-for="item in infoCards" :key="item.label" :iconPath="item.iconPath" :label="item.label"
                :value="item.value" :unit="item.unit" :valueFirst="true" class="info-data-card" />
            </div>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>关键工序与质检节点</h1>
          </template>
          <div class="box-main-content">
            <div class="card-list-container">
              <DeviceMonitorCard v-for="(item, index) in deviceMonitors" :key="index" :config="item"
                :groupWidths="['40%', '60%']" />
            </div>
          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>制造轨迹</h1>
          </template>
          <div class="box-main-content card-list-container">
            <DiagnosisCard v-for="(item, index) in trackList" :key="'track-' + index" :tagText="item.tagText"
              :tagWidth="'5.6rem'" :title="item.title">
              <template v-slot:header-right>
                <div class="stacked-dates">
                  <div>{{ item.date1 }}</div>
                  <div class="divider-date">|</div>
                  <div>{{ item.date2 }}</div>
                </div>
              </template>
              <template v-slot:content>
                <div class="custom-card-content justify-between">
                  <span class="info-text">{{ item.factoryListKey }}<span class="desc-val">{{ item.factoryListVal
                      }}</span></span>
                  <span class="info-text">{{ item.factoryTextKey }}<span class="desc-val">{{ item.factoryTextVal
                      }}</span></span>
                </div>
              </template>
            </DiagnosisCard>
          </div>
        </Box>
      </div>
    </template>

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>核心关键指标与运行状态</h1>
          </template>
          <div class="box-main-content">
            <div class="stat-cards-grid">
              <DataStatCard v-for="item in statCards" :key="item.title" :title="item.title" :icon="item.icon"
                :value="item.value" :unit="item.unit" />
            </div>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>作业与运动状态</h1>
          </template>
          <div class="box-main-content">
            <!-- 在这里封装 -->
            <RunStatusList :listData="runStatusData" />

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">维护建议</span>
              </template>
              <div class="sec3-custom">
                <div class="cyan-title">下次计划保养</div>
                <div class="text-content">
                  2025-03-15 润滑系统保养
                </div>
              </div>
              <div class="sec3-custom">
                <div class="cyan-title">当前维护建议</div>
                <div class="text-content">
                  截齿磨损接近周期，建议本旬安排更换；液压油滤芯剩余 120 H，可结合润滑保养一并更换。
                </div>
              </div>

            </SecBox>
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
import DataCard from "@/components/card/data-card.vue";
import DiagnosisCard from "@/components/card/diagnosisCard.vue";
import DeviceMonitorCard from "@/components/card/deviceMonitorCard.vue";
import SecBox from "@/components/secBox.vue";
import RunStatusList from "./components/RunStatusList.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_4_Device",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    DataStatCard,
    DataCard,
    DiagnosisCard,
    DeviceMonitorCard,
    SecBox,
    RunStatusList,
    LeftToolbar,
  },
  data() {
    return {
      activeToolId: null,
      leftTools: [
        {
          id: "1",
          label: "水晶体",
          icon: require("@/assets/images/page_2_4/水晶体-默认.png"),
          activeIcon: require("@/assets/images/page_2_4/水晶体-选中.png"),
          isActive: false,
        },
      ],
      infoCards: [
        { label: '所属订单', iconPath: require('@/assets/images/page_2_4/所属订单.png'), value: 'SO-202502-001', unit: '' },
        { label: '生产基地', iconPath: require('@/assets/images/page_2_4/生产基地.png'), value: '山西', unit: '' },
        { label: '制造周期', iconPath: require('@/assets/images/page_2_4/制造周期.png'), value: '02-13~02-24', unit: '' },
        { label: '出厂质量状态', iconPath: require('@/assets/images/page_2_4/出厂质量状态.png'), value: '合格', unit: '' }
      ],
      statCards: [
        { title: '截割转速', icon: require('@/assets/images/page_2_4/截割转速.png'), value: '8.2', unit: 'm/min' },
        { title: '滚筒转速', icon: require('@/assets/images/page_2_4/滚筒转速.png'), value: '32', unit: 'r/min' },
        { title: '牵引速度', icon: require('@/assets/images/page_2_4/牵引速度.png'), value: '0~12', unit: 'm/min' },
        { title: '当前负载率', icon: require('@/assets/images/page_2_4/当前负载率.png'), value: '78', unit: '%' },
      ],
      deviceMonitors: [
        {
          title: 'CNC #1/#2',
          status: '合格',
          headerTag: '滚筒粗车/精镗',
          content: [
            [
              { label: '产线/车间', value: '滚筒加工线' },
              { label: '工艺参数', smallValue: '精镗孔径 H7, RA1.6' }
            ]
          ]
        },
        {
          title: '动平衡机',
          status: '合格',
          headerTag: '滚筒动平衡',
          content: [
            [
              { label: '产线/车间', value: '滚筒加工线' },
              { label: '工艺参数', smallValue: 'G2.5,许用不平衡量 120g·mm' }
            ]
          ]
        },
        {
          title: 'CNC #5',
          status: '合格',
          headerTag: '箱体铣削/钻孔',
          content: [
            [
              { label: '产线/车间', value: '箱体加工线' },
              { label: '工艺参数', smallValue: '孔系位置度 0.05' }
            ]
          ]
        },
        {
          title: '装配/试验台',
          status: '合格',
          headerTag: '整机总装',
          content: [
            [
              { label: '产线/车间', value: '总装A线' },
              { label: '工艺参数', smallValue: '液压31.5MPa, 跑合2h' }
            ]
          ]
        },
        {
          title: '装配/试验台',
          status: '合格',
          headerTag: '整机总装',
          content: [
            [
              { label: '产线/车间', value: '总装A线' },
              { label: '工艺参数', smallValue: '液压31.5MPa, 跑合2h' }
            ]
          ]
        },
        {
          title: '装配/试验台',
          status: '合格',
          headerTag: '整机总装',
          content: [
            [
              { label: '产线/车间', value: '总装A线' },
              { label: '工艺参数', smallValue: '液压31.5MPa, 跑合2h' }
            ]
          ]
        },
        {
          title: '装配/试验台',
          status: '合格',
          headerTag: '整机总装',
          content: [
            [
              { label: '产线/车间', value: '总装A线' },
              { label: '工艺参数', smallValue: '液压31.5MPa, 跑合2h' }
            ]
          ]
        },
      ],
      trackList: [
        {
          tagText: '关键部件加工',
          title: 'P-MG750-0001',
          date1: '02-13',
          date2: '02-18',
          factoryListKey: '产线/车间: ',
          factoryListVal: '滚筒加工线',
          factoryTextKey: '工厂: ',
          factoryTextVal: '山西基地'
        },
        {
          tagText: '整机总装',
          title: 'P-MG750-0002',
          date1: '02-19',
          date2: '02-24',
          factoryListKey: '产线/车间: ',
          factoryListVal: '总装A线',
          factoryTextKey: '工厂: ',
          factoryTextVal: '山西基地'
        }
      ],
      runStatusData: [
        { label: '总累计运行时间', value: '2,860 h' },
        { label: '今日最后一次启动', value: '2025-02-26 06:15' },
        { label: '昨日最后一次停机', value: '2025-02-25 22:40' },
        { label: '当日启停次数', value: '2' },
        { label: '当前运动状态', value: '采煤' },
        { label: '主机温度', value: '52°C' },
        { label: '振动状态', value: '正常' }
      ]
    };
  },
  computed: {

  },
  async mounted() {

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
  },

  async beforeDestroy() {

  },
};
</script>

<style lang="scss" scoped>
.info-cards-container {
  height: 100%;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem 0.2rem;
  padding: 0.8rem 0.5rem;
  box-sizing: border-box;

  :deep(.info-data-card) {
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
        font-size: var(--font-size-14);
      }
    }
  }
}

.card-list-container {
  padding: 0.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
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

.sec3-custom {
  // margin-top: 0rem;
  padding: 0.5rem 0.2rem 0;

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

.stat-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.35rem;
  box-sizing: border-box;
  height: 100%;
}

.box-main-content {
  height: 100%;
  width: 100%;
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

  .desc-val {
    color: #ffffff;
    font-size: var(--font-size-12);
    margin: 0 0.3rem;
  }
}

.stacked-dates {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--font-size-10);
  color: rgba(255, 255, 255, 1);
  font-family: var(--font-family-number);
  line-height: 1;

  .divider-date {
    font-size: 10px;
    transform: scale(0.8);
    color: rgba(255, 255, 255, 1);
    margin: 2px 0;
  }
}

.content-left {
  .box1 {
    height: 19.7%;
  }

  .box2 {
    height: 41%;
  }

  .box3 {
    height: 26.7%;
  }
}

.content-right {
  .box1 {
    height: 20.6%;
  }

  .box2 {
    height: 71.5%;
  }
}
</style>
