<template>
  <Layout :aside="true" :main="true">
    <template v-slot:aside-left-tools>
      <LeftToolbar :toolsData="leftTools" @selectItem="handleToolSelect" />
    </template>

    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>生产计划</h1>
          </template>
          <div class="box-main-content">
            <PeriodTabs v-model="planPeriod" :tabs="planTabs" />
            <div class="data-card-group">
              <DataCard
                icon="temp"
                label="预计产量"
                :value="currentPlanData.expected"
                unit=""
                :iconPath="
                  require('@/assets/images/page_2_2/expected_output.png')
                "
                :valueFirst="true"
              />
              <DataCard
                icon="temp"
                label="实际产出"
                :value="currentPlanData.actual"
                unit=""
                :iconPath="
                  require('@/assets/images/page_2_2/actual_output.png')
                "
                :valueFirst="true"
              />
            </div>
            <!-- 这里折线图 -->
            <ProductionPlanChart :chartData="currentPlanChartData" />
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>产出物详情</h1>
          </template>
          <div class="box-main-content">
            <DualProgressList :listData="outputDetailList" />
          </div>
        </Box>
        <Box class="box3" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>订单信息列表</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable
              :columns="orderColumns"
              :tableData="orderData"
              :headerColor="'#9BF8FF'"
            />
          </div>
        </Box>
      </div>
    </template>

    <!-- <div class="action-buttons">
            <div class="action-btn disabled" @click="goToWorkshop">
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
            <h1>质量管理</h1>
          </template>
          <div class="box-main-content">
            <!-- 良品率环形饼图 -->
            <div class="quality-pie-wrap">
              <QualityPie
                :data="qualityPieData"
                :bgImage="require('@/assets/images/page_2_2/pie_bg.png')"
                ratio="332/148"
              />
            </div>

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">抽检记录</span>
              </template>
              <div class="card-list-container sec2-content">
                <DeviceMonitorCard
                  v-for="(item, index) in processBalanceList"
                  :key="'process-' + index"
                  :config="item"
                />
              </div>
            </SecBox>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>不良品处置记录</h1>
          </template>
          <div class="box-main-content">
            <div class="card-list-container">
              <DeviceMonitorCard
                v-for="(item, index) in defectList"
                :key="'defect-' + index"
                :config="item"
                :groupWidths="['25%', '32%', '40%']"
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
import DeviceMonitorCard from "@/components/card/deviceMonitorCard.vue";
import PeriodTabs from "@/components/periodTabs.vue";
import DataCard from "@/components/card/data-card.vue";

import WorkshopTable from "@/components/table/workshopTable.vue";
import DualProgressList from "@/components/progress/dualProgressList.vue";
import ProductionPlanChart from "./components/production-plan-chart.vue";

import LeftToolbar from "@/components/toolBar/leftToolbar.vue";
import QualityPie from "./components/quality-pie.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_2",
  mixins: [wdpapi],

  components: {
    Layout,
    Box,
    SecBox,
    DeviceMonitorCard,
    PeriodTabs,
    DataCard,
    WorkshopTable,
    DualProgressList,
    ProductionPlanChart,
    LeftToolbar,
    QualityPie,
  },
  data() {
    return {
      leftTools: [
        {
          id: "1",
          label: "设备",
          icon: require("@/assets/images/page_2_2/设备-默认.png"),
          activeIcon: require("@/assets/images/page_2_2/设备-选中.png"),
          isActive: false,
        },
        {
          id: "2",
          label: "工位",
          icon: require("@/assets/images/page_2_2/工位-默认.png"),
          activeIcon: require("@/assets/images/page_2_2/工位-选中.png"),
          isActive: false,
        },
        {
          id: "3",
          label: "堆存区",
          icon: require("@/assets/images/page_2_2/堆存区-默认.png"),
          activeIcon: require("@/assets/images/page_2_2/堆存区-选中.png"),
          isActive: false,
        },
        {
          id: "4",
          label: "质检区",
          icon: require("@/assets/images/page_2_2/质检区-默认.png"),
          activeIcon: require("@/assets/images/page_2_2/质检区-选中.png"),
          isActive: false,
        },
      ],
      planPeriod: "month",
      planTabs: [
        { key: "month", label: "月" },
        { key: "week", label: "周" },
        { key: "day", label: "日" },
      ],
      planDataMap: {
        month: {
          expected: 195,
          actual: 200,
        },
        week: {
          expected: 48,
          actual: 50,
        },
        day: {
          expected: 7,
          actual: 9,
        },
      },
      planChartDataMap: {
        month: {
          xData: ["第1周", "第2周", "第3周", "第4周"],
          yData: [
            {
              name: "计划累计",
              data: [42, 96, 148, 195],
              color: "#8E9CAE",
              lineType: "dashed",
            },
            {
              name: "实际累计",
              data: [45, 102, 155, 200],
              color: "#0FDACB",
              lineType: "solid",
            },
          ],
        },
        week: {
          xData: ["周一", "周二", "周三", "周四", "周五"],
          yData: [
            {
              name: "计划累计",
              data: [6, 18, 30, 40, 48],
              color: "#8E9CAE",
              lineType: "dashed",
            },
            {
              name: "实际累计",
              data: [7, 20, 32, 42, 50],
              color: "#0FDACB",
              lineType: "solid",
            },
          ],
        },
        day: {
          xData: ["8:00", "10:00", "12:00", "14:00", "16:00"],
          yData: [
            {
              name: "计划累计",
              data: [1, 2, 4, 6, 7],
              color: "#8E9CAE",
              lineType: "dashed",
            },
            {
              name: "实际累计",
              data: [2, 3, 5, 7, 9],
              color: "#0FDACB",
              lineType: "solid",
            },
          ],
        },
      },
      orderColumns: [
        { key: "line", label: "产线", flex: 1, type: "workshop-tag" },
        { key: "plan", label: "计划", flex: 1.5 },
        { key: "potential", label: "生产潜力", flex: 1 },
      ],
      orderData: [
        { line: "滚筒线", plan: "P-BOX-01 全天", potential: "70%" },
        { line: "总装A线", plan: "MG750 2台", potential: "100%" },
        { line: "滚筒线", plan: "P-BOX-01 全天", potential: "80%" },
      ],
      outputDetailList: [
        {
          label: "滚筒箱体",
          expected: 40,
          actual: 44,
          max: 70,
          status: "领先",
        },
        { label: "箱体", expected: 28, actual: 26, max: 40, status: "滞后" },
        { label: "轴类件", expected: 65, actual: 68, max: 80, status: "领先" },
        { label: "端盖", expected: 33, actual: 33, max: 50, status: "持平" },
      ],
      processBalanceList: [
        {
          title: "BATCH-750-001",
          status: "合格",
          titleStyle: "gray",
          content: [
            { type: "tag", value: "滚筒箱体", class: "tag-type3" },
            { label: "时间", value: "02-28 09:00" },
          ],
        },
        {
          title: "BATCH-750-002",
          status: "合格",
          titleStyle: "gray",
          content: [
            { type: "tag", value: "滚筒箱体", class: "tag-type3" },
            { label: "时间", value: "02-28 09:00" },
          ],
        },
        {
          title: "BATCH-500-003",
          status: "不合格",
          titleStyle: "gray",
          content: [
            { type: "tag", value: "箱体", class: "tag-type3" },
            { label: "时间", value: "02-28 09:00" },
          ],
        },
      ],
      qualityPieData: [
        { name: "良品", value: 88.1 },
        { name: "不良", value: 11.9 },
      ],
      defectList: [
        {
          title: "BATCH-500-003",
          status: "返工",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "孔径超差" },
              { label: "处置人", value: "质检科" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
        {
          title: "BATCH-400-002",
          status: "报废",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "表面划伤" },
              { label: "处置人", value: "车间" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
        {
          title: "BATCH-400-002",
          status: "报废",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "表面划伤" },
              { label: "处置人", value: "车间" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
        {
          title: "BATCH-400-002",
          status: "报废",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "表面划伤" },
              { label: "处置人", value: "车间" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
        {
          title: "BATCH-400-002",
          status: "报废",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "表面划伤" },
              { label: "处置人", value: "车间" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
        {
          title: "BATCH-400-002",
          status: "报废",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "表面划伤" },
              { label: "处置人", value: "车间" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
        {
          title: "BATCH-400-002",
          status: "报废",
          titleStyle: "gray",
          content: [
            [
              { label: "缺陷", value: "表面划伤" },
              { label: "处置人", value: "车间" },
              { label: "时间", value: "02-27 17:00" },
            ],
          ],
        },
      ],
    };
  },
  computed: {
    currentPlanData() {
      return this.planDataMap[this.planPeriod];
    },
    currentPlanChartData() {
      return this.planChartDataMap[this.planPeriod];
    },
  },
  async mounted() {},

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
      this.$router.push("/page_2/2-workshop");
    },
    goToDevice() {
      this.$router.push({
        path: "/page_2/2-device",
        query: { from: "workshop" },
      });
    },
  },

  async beforeDestroy() {},
};
</script>

<style lang="scss" scoped>
.data-card-group {
  display: flex; 
  width: 100%;
  padding: 1.4rem 0 1.4rem 1.3rem;
  gap: 3.5rem;
  margin-bottom: 0.1rem;
}

.box-main-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-list-container {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow-y: auto;
  height: calc(100% - 0.5rem);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #63768d;
    border-radius: 3px;

    &:hover {
      background: #748292;
    }
  }
}

.content-left {
  .box1 {
    height: 37%;
  }

  .box2 {
    height: 29%;
  }

  .box3 {
    height: 21.4%;

    .box-main-content {
      padding: 0.5rem 0.2rem;
    }
  }
}

.content-right {
  .box1 {
    height: 50%;

    .quality-pie-wrap {
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sec2 {
      height: 68%;
      flex-shrink: 0;
      .sec2-content {
        padding: 1.2rem 0.5rem;
      }
    }
  }

  .box2 {
    height: 42%;
  }
}

.sec-title {
  font-size: var(--font-size-14);
  color: rgba(238, 248, 253, 0.9);
  font-family: var(--font-family-primary-Regular);
  padding-left: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translateX(-50%) translateY(-50%);

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
