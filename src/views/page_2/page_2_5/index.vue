<template>
  <Layout :aside="true" :main="true">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box-item box-1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>内部设备运行态势</h1>
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
            <h1>车间设备视图</h1>
          </template>
          <div class="box-main-content">
            <div class="work-table">
              <WorkshopTable :columns="workshopColumns" :tableData="workshopData" />
            </div>

            <SecBox class="sec1">
              <template v-slot:header>
                <span>今日计划外停机明细</span>
              </template>
              <WorkshopTable :columns="shutdownColumns" :tableData="shutdownData" rowBg="rgba(255, 142, 81, 0.10)" :rowHoverBgType="'type2'" />
            </SecBox>
          </div>
        </Box>

        <Box class="box-item box-3" :delayTime="300" position="left">
          <template v-slot:header>
            <h1>各车间OEE与目标对比</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="oeeColumns" :tableData="oeeData" />
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
      <div class="action-btn" @click="goToDevice">
        <span>设备</span>
      </div>
    </div> -->

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box-item box-1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>诊断与建议</h1>
          </template>
          <div class="box-main-content">
            <SecBox class="sec1">
              <template v-slot:header>
                <span class="sec-title">瓶颈与能效建议</span>
              </template>
              <div class="container">机加车间的 CNC #2
                与箱体加工线是当前瓶颈点，建议优先优化其刀具管理与换型流程，同时评估引入一台新设备的投资回报；动平衡机利用率较低，可与其他工厂共享产能或承接外协业务提高利用。
              </div>

            </SecBox>
            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">瓶颈设备与待办维护</span>
              </template>
              <div class="diagnosis-list-container">
                <DiagnosisCard
                  v-for="(item, index) in diagnosisList"
                  :key="index"
                  :tagText="item.tag"
                  :title="item.title"
                  :suggestion="item.suggestion" 
                />
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
import SecBox from "@/components/secBox.vue";
import DataStatCard from '@/components/card/dataStatCard.vue'
import WorkshopTable from '@/components/table/workshopTable.vue'
import DiagnosisCard from '@/components/card/diagnosisCard.vue'
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_5",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    SecBox,
    DataStatCard,
    WorkshopTable,
    DiagnosisCard,
  },
  data() {
    return {
      diagnosisList: [
        { tag: '瓶颈', title: 'CNC #2/箱体线', suggestion: '建议：优化换型与刀路，评估新增产能' },
        { tag: '维护', title: 'CNC #5', suggestion: '建议：今日主轴报警已排除，建议本周安排预防性检查' },
        { tag: '利用', title: '动平衡机', suggestion: '建议：可接外协或与兄弟工厂共享排产' },
        { tag: '利用', title: '动平衡机', suggestion: '建议：可接外协或与兄弟工厂共享排产' },
        { tag: '利用', title: '动平衡机', suggestion: '建议：可接外协或与兄弟工厂共享排产' },
        { tag: '利用', title: '动平衡机', suggestion: '建议：可接外协或与兄弟工厂共享排产' }
      ],
      shutdownColumns: [
        { key: 'index', label: '', flex: 0.5, type: 'index-tag' },
        { key: 'time', label: '时间', flex: 1 },
        { key: 'device', label: '设备', flex: 1.2 },
        { key: 'duration', label: '时长', flex: 1 },
        { key: 'reason', label: '原因', flex: 1, type: 'highlight-orange' },
      ],
      shutdownData: [
        { time: '09:20', device: 'CNC #5', duration: '45 min', reason: '主轴报警' },
        { time: '09:20', device: '动平衡机', duration: '45 min', reason: '换型' },
      ],
      workshopColumns: [
        { key: 'workshop', label: '车间', flex: 1.2, type: 'workshop-tag' },
        { key: 'keyDevice', label: '关键设备', flex: 1.5 },
        { key: 'oee', label: 'OEE', flex: 0.8 },
        { key: 'online', label: '在线/总数', flex: 1, type: 'online' },
        { key: 'bottleneck', label: '瓶颈说明', flex: 1.2 },
      ],
      workshopData: [
        { workshop: '机加车间', keyDevice: 'CNC 线#1/#2 动平衡机', oee: '86%', onlineCount: 34, totalCount: 36, bottleneck: 'CNC #2' },
        { workshop: '焊接车间', keyDevice: '焊接机器人群', oee: '82%', onlineCount: 22, totalCount: 24, bottleneck: '换型时间长' },
        { workshop: '总装车间', keyDevice: '总装提升机/试验台', oee: '88%', onlineCount: 12, totalCount: 12, bottleneck: '试验台' },
        { workshop: '备件车间', keyDevice: '小型加工中心', oee: '79%', onlineCount: 10, totalCount: 12, bottleneck: '机床故障' },
      ],
      oeeColumns: [
        { key: 'workshop', label: '车间', flex: 1.5, type: 'workshop-tag' },
        { key: 'oee', label: 'OEE', flex: 1 },
        { key: 'target', label: '目标', flex: 1, type: 'target' },
        { key: 'gap', label: '差距', flex: 1, type: 'gap' },
      ],
      oeeData: [
        { workshop: '机加车间', oee: '86%', target: '88%', gap: '-2%' },
        { workshop: '焊接车间', oee: '82%', target: '85%', gap: '-3%' },
        { workshop: '总装车间', oee: '88%', target: '90%', gap: '+1%' },
        { workshop: '备件车间', oee: '79%', target: '82%', gap: '-3%' },
      ],
      statCards: [
        {
          title: '本厂设备数',
          icon: require('@/assets/images/page_2_5/equipment.png'),
          value: 84,
          unit: '台',
        },
        {
          title: '关键设备在线率',
          icon: require('@/assets/images/page_2_5/online.png'),
          value: 99.1,
          unit: '%',
        },
        {
          title: '计划外停机',
          icon: require('@/assets/images/page_2_5/shutdown.png'),
          value: 4.8,
          unit: '时/天',
        },
        {
          title: '工厂OEE',
          icon: require('@/assets/images/page_2_5/OEE.png'),
          value: 88,
          unit: '%',
        },
      ],
    };
  },
  computed: {

  },
  async mounted() {

  },

  methods: {
    goToWorkshop() {
      this.$router.push('/page_2/5-workshop');
    },
    goToDevice() {
      this.$router.push({ path: '/page_2/5-device', query: { from: 'factory' } });
    },
  },

  async beforeDestroy() {

  },
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
}

.content-left {
  .box-1 {
    height: 20%;
  }

  .box-2 {
    height: 42%;

    .box-main-content {
      .work-table {
        height: 13.3rem;
      }

      .sec1 {
        height: 11rem;
        margin-top: 0.7rem;
      }
    }
  }

  .box-3 {
    height: 25%;
  }
}

.content-right {
  .box-1 {
    height: 97%;

    .box-main-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0 0.5rem;

      .sec1 {
        height: 17%;
        .container {
          padding: 1rem 1.5rem;
          // background: rgba(45, 154, 222, 0.05);
          // border: 1px solid rgba(45, 154, 222, 0.3);
          // border-radius: 0.5rem;
          font-size: var(--font-size-12);
          line-height: var(--font-size-20);
          color: #FFFFFF;
          font-family: var(--font-family-primary-Regular);
        }
      }

      .sec2 {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .diagnosis-list-container {
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 0rem 0.5rem 0;
          box-sizing: border-box;
          
          /* 自定义滚动条精简版 */
          &::-webkit-scrollbar {
            width: 4px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: rgba(49, 174, 255, 0.3);
            border-radius: 4px;
          }
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  justify-content: center;
  align-items: center;
  z-index: 100;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);

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
