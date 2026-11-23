<template>
  <Layout :aside="true">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>单台CNC作业队列</h1>
          </template>
          <div class="box-main-content">
            <!-- 在这里完成datacard -->
            <div class="data-card-group">
              <DataCard
                icon="temp"
                label="待加工工单数"
                value="4"
                unit=""
                :iconPath="require('@/assets/images/page_2_2/processing.png')"
                :valueFirst="true"
              />
              <DataCard
                icon="temp"
                label="当前负载率"
                value="68"
                unit="%"
                :iconPath="require('@/assets/images/page_2_2/load_rate.png')"
                :valueFirst="true"
              />
            </div>

            <SecBox class="sec2">
              <template v-slot:header>
                <span class="sec-title">抽检记录</span>
              </template>
              <div class="card-list-container">
                <DiagnosisCard
                  v-for="(item, index) in cNCOperationList"
                  :key="'cnc-' + index"
                  :config="item"
                />
              </div>
            </SecBox>
          </div>
        </Box>

        <Box class="box2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>诊断与建议</h1>
          </template>
          <div class="box-main-content">
            <div class="card-list-container">
              <DeviceMonitorCard
                v-for="(item, index) in diagnosisList"
                :key="'diag-' + index"
                :config="item"
                :groupWidths="['40%', '60%']"
              />
            </div>
          </div>
        </Box>
      </div>
    </template>

    <!-- <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box-item" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>智能生产-设备数据3</h1>
          </template>
          <div class="box-main-content">
            
          </div>
        </Box>

        <Box class="box-item" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>智能生产-设备数据4</h1>
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
import DeviceMonitorCard from "@/components/card/deviceMonitorCard.vue";
import DiagnosisCard from "@/components/card/diagnosisCard.vue";
import SecBox from "@/components/secBox.vue";
import DataCard from "@/components/card/data-card.vue";
import wdpapi from "./mixins/wdpapi";

export default {
  name: "Page_2_2_Device",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    DeviceMonitorCard,
    DiagnosisCard,
    SecBox,
    DataCard,
  },
  data() {
    return {
      cNCOperationList: [
        {
          index: "1",
          title: "BATCH-750-001",
          time: "18",
          workpiece: "滚筒箱体",
          program: "P-BOX-01",
        },
        {
          index: "2",
          title: "BATCH-750-002",
          time: "18",
          workpiece: "滚筒箱体",
          program: "P-BOX-01",
        },
        {
          index: "3",
          title: "BATCH-750-003",
          time: "20",
          workpiece: "箱体",
          program: "P-BOX-02",
        },
      ],
      diagnosisList: [
        {
          titleStyle: "gray",
          title: "BATCH-750-001",
          status: "加工中",
          content: [
            { type: "tag", value: "滚筒箱体", class: "tag-type3" }, // Adjusting to tag-type3 which is blue background
            [
              { label: "类型", value: "当前" },
              { label: "程序", value: "P-BOX-01" },
            ],
          ],
        },
        {
          titleStyle: "gray",
          title: "BATCH-750-000",
          status: "已完成",
          content: [
            { type: "tag", value: "滚筒箱体", class: "tag-type3" },
            [
              { label: "类型", value: "历史" },
              { label: "程序", value: "P-BOX-01" },
            ],
          ],
        },
        {
          titleStyle: "gray",
          title: "BATCH-750-000",
          status: "已完成",
          content: [
            { type: "tag", value: "滚筒箱体", class: "tag-type3" },
            [
              { label: "类型", value: "历史" },
              { label: "程序", value: "P-BOX-01" },
            ],
          ],
        },
        {
          titleStyle: "gray",
          title: "BATCH-750-000",
          status: "已完成",
          content: [
            { type: "tag", value: "滚筒箱体", class: "tag-type3" },
            [
              { label: "类型", value: "历史" },
              { label: "程序", value: "P-BOX-01" },
            ],
          ],
        },
      ],
    };
  },
  computed: {},
  async mounted() {},

  methods: {},

  async beforeDestroy() {},
};
</script>

<style lang="scss" scoped>
.data-card-group {
  display: flex;
  width: 100%;
  gap: 1.8rem;
  padding: 1.5rem 1rem 1.5rem 1.5rem;
  margin-bottom: 0.4rem;
}

.box-main-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.content-left {
  .box1 {
    height: 46%;
    .box-main-content {
      .sec2 {
        flex: 1;
      }
    }
  }

  .box2 {
    height: 46%;
  }
}

.content-right {
  .box-item {
    height: 48%;
    margin-bottom: 4%;
  }
}

.card-list-container {
  padding: 1.5rem 0.5rem 0;
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
    background: #63768d;
    border-radius: 3px;

    &:hover {
      background: #748292;
    }
  }
}
</style>
