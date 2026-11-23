<template>
  <Layout :aside="true" :main="true">

    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>整体能耗与能源结构</h1>
          </template>
          <div class="box-main-content">
            <div class="data-card-group">
              <DataCard icon="temp" label="年度总能耗" value="31.5" unit="GWh"
                :iconPath="require('@/assets/images/page_2_6/年度总能耗.png')" :valueFirst="true" />
              <DataCard icon="temp" label="能耗金额" value="2,180" unit="万元"
                :iconPath="require('@/assets/images/page_2_6/能耗金额.png')" :valueFirst="true" />
            </div>
            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">能源来源比例</span>
              </template>
              <div class="sec2-content"></div>
              <EnergySourcePie :data="energySourceData" :bgImage="require('@/assets/images/page_2_6/pie_bg.png')" />
            </SecBox>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>能源异常数据列表</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="abnormalColumns" :tableData="abnormalData" :style="{ height: '100%' }"
              headerColor="#9BF8FF" />
          </div>
        </Box>

        <Box class="box3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>各车间能耗数据</h1>
          </template>
          <div class="box-main-content">
            <PeriodTabs v-model="tabPeriod"
              :tabs="[{ label: '日', key: 'day' }, { label: '月', key: 'month' }, { label: '年', key: 'year' }]" />
            <WorkshopEnergy :data="workshopEnergyData" />
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
            <h1>能力模块</h1>
          </template>
          <div class="box-main-content">
            <CapabilityPanel
              v-model="selectedModuleId"
              :modules="capabilityModules"
              :icons="assistantIcons"
            />
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
import PeriodTabs from "@/components/periodTabs.vue";
import DataCard from "@/components/card/data-card.vue";
import WorkshopTable from "@/components/table/workshopTable.vue";
import WorkshopEnergy from "./components/workshopEnergy.vue";
import EnergySourcePie from "./components/energySourcePie.vue";
import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import CapabilityPanel from "./components/capability/CapabilityPanel.vue";
import capabilityModules, { assistantIcons } from "./data/moduleConfig.js";
import wdpapi from "./mixins/wdpapi-w";

export default {
  name: "Page_2_6_W",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    SecBox,
    PeriodTabs,
    DataCard,
    WorkshopTable,
    WorkshopEnergy,
    EnergySourcePie,
    LeftToolbar,
    CapabilityPanel
  },
  data() {
    return {
      capabilityModules,
      assistantIcons,
      selectedModuleId: capabilityModules[0].id,
      leftTools: [
        {
          id: "1",
          label: "发电设施",
          icon: require("@/assets/images/page_2_6/发电设施-默认.png"),
          activeIcon: require("@/assets/images/page_2_6/发电设施-选中.png"),
          isActive: false,
        },
        {
          id: "2",
          label: "变压器",
          icon: require("@/assets/images/page_2_6/变压器-默认.png"),
          activeIcon: require("@/assets/images/page_2_6/变压器-选中.png"),
          isActive: false,
        },
        // {
        //   id: "3",
        //   label: "配电柜",
        //   icon: require("@/assets/images/page_2_6/配电柜-默认.png"),
        //   activeIcon: require("@/assets/images/page_2_6/配电柜-选中.png"),
        //   isActive: false,
        // }
      ],
      energySourceData: [
        { name: '新能源发电', value: 28, key: 'newEnergy' },
        { name: '电网购买', value: 37, key: 'gridPurchase' },
        { name: '自发电', value: 35, key: 'selfGeneration' },
      ],
      tabPeriod: 'day',
      workshopEnergyAllData: {
        day: [
          { name: '机加车间', value: 88, unit: 'MWh' },
          { name: '焊接车间', value: 76, unit: 'MWh' },
          { name: '总装车间', value: 72, unit: 'MWh' }
        ],
        month: [
          { name: '机加车间', value: 2640, unit: 'MWh' },
          { name: '焊接车间', value: 2280, unit: 'MWh' },
          { name: '总装车间', value: 2160, unit: 'MWh' }
        ],
        year: [
          { name: '机加车间', value: 31680, unit: 'MWh' },
          { name: '焊接车间', value: 27360, unit: 'MWh' },
          { name: '总装车间', value: 25920, unit: 'MWh' }
        ]
      },
      abnormalColumns: [
        { label: '时间', key: 'time', flex: 1.3, type: 'common' },
        { label: '区域', key: 'area', flex: 0.7, type: 'common' },
        { label: '描述', key: 'desc', flex: 1.6, type: 'common' },
        { label: '级别', key: 'level', flex: 0.6, type: 'status-dot' }
      ],
      abnormalData: [
        { time: '02-28 14:20', area: '机加车间', desc: '空压瞬时负荷超阈值', level: '告警' },
        { time: '02-28 14:20', area: '总装试验', desc: '试验台用电峰值异常', level: '提示' },
        { time: '02-28 14:20', area: '总装试验', desc: '试验台用电峰值异常', level: '提示' },
        { time: '02-28 14:20', area: '总装试验', desc: '试验台用电峰值异常', level: '提示' }
      ]
    };
  },
  computed: {
    workshopEnergyData() {
      return this.workshopEnergyAllData[this.tabPeriod] || [];
    }
  },
  watch: {
    selectedModuleId(moduleId) {
      this.handleModuleChange(moduleId);
    }
  },
  mounted() { },

  async beforeDestroy() {

  },
  methods: {
    // 能力模块下拉切换：与左侧工具栏互斥，并切换到对应的 3D 场景效果
    async handleModuleChange(moduleId) {
      if (this.leftTools.some((tool) => tool.isActive)) {
        this.leftTools.forEach((tool) => {
          tool.isActive = false;
        });
        await this.closeAllW();
      }
      await this.applyModuleSceneW(moduleId);
    },

    async handleToolSelect(selectedItem) {
      const toolId = Number(selectedItem.id);
      // LeftToolbar 内部维护的是 toolsData 的深拷贝，isActive 不会自动回写，这里手动同步
      const tool = this.leftTools.find((t) => t.id === selectedItem.id);
      if (tool) tool.isActive = selectedItem.isActive;

      await this.clearModuleSceneW();

      if (typeof this.closeAllW === "function") {
        await this.closeAllW();
      }

      if (!selectedItem.isActive) return;

      const handler = this.toolHandlersW?.[toolId];
      const data = this.toolDataW?.[toolId];
      if (typeof handler === "function") {
        await handler(data, toolId);
      }
    },
    goToWorkshop() {
      this.$router.push('/page_2/6-workshop');
    },
  }
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.data-card-group {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 1rem 0.2rem;
  flex-shrink: 0;
}

.sec2 {
  // flex: 1;
  min-height: 0;
  overflow: hidden;
}

.content-left {
  .box1 {
    height: 38.3%;
    .sec2-content {
      padding-top: 1.2rem;
    }
  }

  .box2 {
    height: 25.2%;
  }

  .box3 {
    height: 24.2%;
  }
}

.content-right { 
  :deep(.box) {
    display: flex;
    flex-direction: column;
  }
  :deep(.box-main) {
    flex: 1;
    min-height: 0;
    height: auto;
  }
  :deep(.box-main-content) {
    overflow: hidden;
  }

  .box1 {
    height: 101.5%;
  }
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  img {
    height: 1.6rem;
    width: auto;
    object-fit: contain;
  }
}

.car-bon-card {
  padding: 0.3rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
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
