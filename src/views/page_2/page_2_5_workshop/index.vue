<template>
  <Layout :aside="true" :headerTool="true" :main="true" :footerTool="false">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>设备矩阵与节拍匹配</h1>
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
            <h1>关键工序设备一览</h1>
          </template>
          <div class="box-main-content box2-content">
            <DeviceMonitorCard v-for="(item, index) in deviceMonitors" :key="index" :config="item"
              :groupWidths="['35%', '30%', '35%']" />
          </div>
        </Box>
        <Box class="box3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>产线节拍与瓶颈</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="beatColumns" :tableData="beatData" :headerColor="'#9BF8FF'" />
          </div>
        </Box>
        <Box class="box4" :delayTime="400" position="left">
          <template v-slot:header>
            <h1>今日换型/保养计划</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="planColumns" :tableData="planData" :headerColor="'#9BF8FF'" />
          </div>
        </Box>
      </div>
    </template>

    <template v-slot:aside-left-tools>
      <sideBarLeft :sideBarListData="sideBarListData" @selectItem="sideBarSelectItem" />
    </template>

    <!-- <div class="action-buttons">
      <div class="action-btn disabled">
        <span>车间</span>
      </div>
      <div class="action-btn disabled">
        <span>仓库</span>
      </div>
      <div class="action-btn" @click="goToDevice">
        <span>设备</span>
      </div>
    </div> -->

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>诊断与建议</h1>
          </template>
          <div class="box-main-content">
            <SecBox class="sec1">
              <template v-slot:header>
                <span class="sec-title">节拍匹配与排程提示</span>
              </template>
              <div class="text-content">
                滚筒加工线中精镗位（CNC #2）利用率接近 90%，在当前班次内可能成为限制节拍的关键工序，应考虑通过工艺优化或跨线分担部分工序以降低风险。
              </div>
            </SecBox>

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">工序平衡与设备协同</span>
              </template>
              <div class="coord-content">
                <DiagnosisCard tagText="滚筒加工线" title="" suggestion="精镗位负荷高，可预排部分工序至 CNC #1 或错峰换型" />
                <DiagnosisCard tagText="箱体加工线" title="" suggestion="CNC #5 恢复后优先清尾，避免在制品积压" />
                <div class="sec3-custom">
                  <div class="cyan-title">今日换型提醒</div>
                  <div class="text-content">
                    CNC #2 计划 16:00 换型至 P-BOX-01，请提前备料与程序确认，预计占用约 25 分钟。
                  </div>
                </div>
              </div>
            </SecBox>


          </div>
        </Box>
      </div>
    </template>

    <template v-slot:header-tool>
      <div class="header-tool-content">
        <HeaderItem v-for="item in headerToolsData" :key="item.id" :headerToolsItemData="item" />
      </div>
    </template>

    <!-- <template v-slot:footer-tool>
      <bottomBar
        :footerToolsData="footerToolsData"
        :footerToolHeaderName="footerToolHeaderName"
        :footerToolHeaderEn="footerToolHeaderEn"
        @footerSelectItem="footerSelectItem"
      />
    </template> -->
  </Layout>
</template>

<script>
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";
import sideBarLeft from "@/components/sideBarLeft.vue";
import HeaderItem from "@components/toolBar/headerTool.vue";
import bottomBar from "@/components/bottomBar.vue";
import { mapState } from 'vuex';

import SecBox from "@/components/secBox.vue";
import DataStatCard from '@/components/card/dataStatCard.vue';
import WorkshopTable from '@/components/table/workshopTable.vue';
import DiagnosisCard from '@/components/card/diagnosisCard.vue';
import DeviceMonitorCard from '@/components/card/deviceMonitorCard.vue';
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_5_Workshop",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    sideBarLeft,
    HeaderItem,
    bottomBar,
    SecBox,
    DataStatCard,
    WorkshopTable,
    DiagnosisCard,
    DeviceMonitorCard,
  },
  data() {
    return {
      statCards: [
        { title: '车间设备数', icon: require('@/assets/images/page_2_5/equipment.png'), value: 29, unit: '台' },
        { title: '在线率', icon: require('@/assets/images/page_2_5/online.png'), value: 96, unit: '%' },
        { title: '疑似瓶颈设备', icon: require('@/assets/images/page_2_5/suspected.png'), value: 2, unit: '台' },
        { title: '停机设备', icon: require('@/assets/images/page_2_5/shutdown.png'), value: 1, unit: '台' },
      ],
      beatColumns: [
        { key: 'line', label: '产线', flex: 1.2, type: 'workshop-tag' },
        { key: 'beat', label: '当前节拍', flex: 1 },
        { key: 'bottleneck', label: '瓶颈工序', flex: 1 },
        { key: 'plan', label: '改善计划', flex: 1 },
      ],
      beatData: [
        { line: '滚筒加工线', beat: '12.5 min', bottleneck: '精镗位', plan: '优化刀路' },
        { line: '箱体加工线', beat: '18 min', bottleneck: 'CNC #5\n故障', plan: '待恢复' },
      ],
      planColumns: [
        { key: 'device', label: '设备', flex: 0.8 },
        { key: 'time', label: '计划时间', flex: 1 },
        { key: 'content', label: '内容', flex: 1.5 },
        { key: 'duration', label: '预计耗时', flex: 0.8 },
      ],
      planData: [
        { device: 'CNC #2', time: '今日16:00', content: 'P-GUN-ROLL-02\n→ P-BOX-01', duration: '约25min' }
      ],
      deviceMonitors: [
        {
          title: 'CNC #1',
          status: '运行',
          headerTag: '滚筒加工线',
          content: [
            [
              { label: '工序/工位', value: '粗车位' },
              { label: '负荷', value: '75', unit: '%', valueClass: 'load-value' },
              { label: '备注', value: '正常' }
            ]
          ]
        },
        {
          title: 'CNC #2',
          status: '运行',
          headerTag: '滚筒加工线',
          content: [
            [
              { label: '工序/工位', value: '精镗位' },
              { label: '负荷', value: '92', unit: '%', valueClass: 'load-value' },
              { label: '备注', value: '潜在瓶颈' }
            ]
          ]
        },
        {
          title: '动平衡机',
          status: '待机',
          headerTag: '滚筒加工线',
          content: [
            [
              { label: '工序/工位', value: '动平衡' },
              { label: '负荷', value: '-', valueClass: 'load-value' },
              { label: '备注', value: '等待工件' }
            ]
          ]
        },
        {
          title: '动平衡机',
          status: '故障',
          headerTag: '箱体加工线',
          content: [
            [
              { label: '工序/工位', value: '箱体铣削' },
              { label: '负荷', value: '-', valueClass: 'load-value' },
              { label: '备注', value: '主轴报警' }
            ]
          ]
        }
      ],
      sideBarListData: [],
      headerToolsData: [],
      footerToolHeaderName: "设备管理-车间事件列表",
      footerToolHeaderEn: "EQUIPMENT MANAGEMENT-WORKSHOP EVENT LIST",
      footerToolsData: [],
    };
  },
  mounted() { },
  computed: {
    ...mapState(['trackPath']),
  },
  async beforeDestroy() {
  },
  methods: {
    goToDevice() {
      this.$router.push({ path: '/page_2/5-device', query: { from: 'workshop' } });
    },
    async footerSelectItem(val) {
      this.sideBarListData = this.sideBarListData.map((item) => ({
        ...item,
        isActive: false,
      }));
    },
    async sideBarSelectItem(val) {
      this.footerToolsData = this.footerToolsData.map((item) => ({
        ...item,
        isActive: false,
      }));
    },
  }
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

.content-left {
  .box1 {
    height: 21%;
  }

  .box2 {
    height: 33.1%;

    .box2-content {
      overflow-y: auto;
      padding-top: 0.5rem;
      padding-right: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(49, 174, 255, 0.3);
        border-radius: 4px;
      }
    }
  }

  .box3 {
    height: 16%;
  }

  .box4 {
    height: 11.3%;
  }
}

.content-right {
  .box1 {
    height: 98%;

    .box-main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0 0.5rem;

      .sec1 {
        height: 15%;

        .text-content {
          font-size: var(--font-size-12);
          line-height: var(--font-size-20);
          color: rgba(255, 255, 255, 0.9);
          font-family: var(--font-family-primary-Regular);
          padding: 1rem 1.5rem;
        }
      }


      .coord-content {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding-top: 0.5rem;
      }

      .sec3-custom {
        margin-top: 1rem;
        padding: 0.5rem 1.3rem;

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
    }
  }
}

.sec-title {
  font-size: var(--font-size-14);
  color: rgba(238, 248, 253, 0.9);
  font-family: var(--font-family-primary-Regular);
  padding-left: 0.5rem;
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
  z-index: 100;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

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