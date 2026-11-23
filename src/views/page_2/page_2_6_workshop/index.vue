<template>
  <Layout :aside="true" :main="true">

    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>能源用量与异常</h1>
          </template>
          <div class="box-main-content">
            <PeriodTabs v-model="tabPeriod"
              :tabs="[{ label: '日', key: 'day' }, { label: '月', key: 'month' }, { label: '年', key: 'year' }]" />
            <div class="data-card-group">
              <DataCard icon="temp" label="实时能源用量" :value="currentEnergyData.realTime" unit="MWh"
                :iconPath="require('@/assets/images/page_2_6/实时能源用量.png')" :valueFirst="true" />
              <DataCard icon="temp" label="内部微电网发电量" :value="currentEnergyData.internal" unit="MWh"
                :iconPath="require('@/assets/images/page_2_6/内部微电网发电量.png')" :valueFirst="true" />
            </div>
            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">改进建议</span>
              </template>
              <div style="height: calc(100% - 30px); width: 100%;">
                <WorkshopTable :columns="abnormalColumns" :tableData="abnormalData" :style="{ height: '100%' }"
                  headerColor="#9BF8FF" />
              </div>
            </SecBox>

          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>双碳监测</h1>
          </template>
          <div class="box-main-content">
            <div class="car-bon-card">
              <CarbonCard v-for="(item, index) in carbonMonitorData" :key="index" :title="item.title"
                :value="item.value" :unit="item.unit" :icon="item.icon" />
            </div>
          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>实时电力市场售电价格</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="powerPriceColumns" :tableData="powerPriceData" headerColor="#9BF8FF" />
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
        <Box class="box-item" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>能源管理-车间数据3</h1>
          </template>
          <div class="box-main-content">

          </div>
        </Box>

        <Box class="box-item" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>能源管理-车间数据4</h1>
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
import PeriodTabs from "@/components/periodTabs.vue";
import DataCard from "@/components/card/data-card.vue";
import CarbonCard from "@/components/card/carbonCard.vue";
import WorkshopTable from "@/components/table/workshopTable.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_6_Workshop",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    SecBox,
    PeriodTabs,
    DataCard,
    CarbonCard,
    WorkshopTable,
    LeftToolbar
  },
  data() {
    return {
      leftTools: [
        // {
        //   id: "1",
        //   label: "发电设施",
        //   icon: require("@/assets/images/page_2_6/发电设施-默认.png"),
        //   activeIcon: require("@/assets/images/page_2_6/发电设施-选中.png"),
        //   isActive: false,
        // },
        // {
        //   id: "2",
        //   label: "变压器",
        //   icon: require("@/assets/images/page_2_6/变压器-默认.png"),
        //   activeIcon: require("@/assets/images/page_2_6/变压器-选中.png"),
        //   isActive: false,
        // },
        {
          id: "1",
          label: "配电柜",
          icon: require("@/assets/images/page_2_6/配电柜-默认.png"),
          activeIcon: require("@/assets/images/page_2_6/配电柜-选中.png"),
          isActive: false,
        }
      ],
      tabPeriod: 'day',
      energyDataMap: {
        year: { realTime: 3832.5, internal: 1022.0 },
        month: { realTime: 315.0, internal: 84.0 },
        day: { realTime: 10.5, internal: 2.8 }
      },
      carbonMonitorData: [
        { title: '万元产值能耗', value: '0.048', unit: '(吨标煤/万元)', icon: require('@/assets/images/page_2_6/万元产值能耗.png') },
        { title: '高能耗设备运行占比', value: '62', unit: '%', icon: require('@/assets/images/page_2_6/高能耗设备运行占比.png') },
        { title: '碳排放强度', value: '1.2', unit: '(TCO₂/万元)', icon: require('@/assets/images/page_2_6/碳排放强度.png') }
      ],
      abnormalColumns: [
        { label: '时间', key: 'time', flex: 1.5, type: 'common' },
        { label: '区域', key: 'area', flex: 1.5, type: 'common' },
        { label: '描述', key: 'desc', flex: 2.5, type: 'common' },
        { label: '级别', key: 'level', flex: 1, type: 'status-dot' }
      ],
      abnormalData: [
        { time: '02-28 14:20', area: '机加车间', desc: '空压瞬时负荷超阈值', level: '告警' },
        { time: '02-28 14:20', area: '总装试验', desc: '试验台用电峰值异常', level: '提示' }
      ],
      powerPriceColumns: [
        { label: '企业名称', key: 'company', flex: 1.5, type: 'common' },
        { label: '价格', key: 'price', flex: 1, type: 'common' },
        { label: '单位', key: 'unit', flex: 1, type: 'common' }
      ],
      powerPriceData: [
        { company: '华能售电', price: '0.582', unit: '元/kWh' },
        { company: '国家电投售电', price: '0.568', unit: '元/kWh' },
        { company: '大唐售电', price: '0.595', unit: '元/kWh' },
        { company: '华润电力', price: '0.576', unit: '元/kWh' }
      ]
    };
  },
  mounted() { },
  computed: {
    currentEnergyData() {
      return this.energyDataMap[this.tabPeriod];
    }
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
      this.$router.push({ path: '/page_2/6-device', query: { from: 'workshop' } });
    },
  }
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
}

.data-card-group {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 1rem 0.2rem;
  margin-bottom: 0.5rem;
}

.car-bon-card {
  padding: 0.3rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.content-left {
  .box1 {
    height: 31.7%;

    .sec2 {
      height: calc(100% - 100px);
    }
  }

  .box2 {
    height: 30.7%;
  }

  .box3 {
    height: 25.4%;
  }
}

// .content-right {
//   .box1 {
//     height: 40%;
//   }
//   .box2 {
//     height: 50%;
//   }
// }

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
