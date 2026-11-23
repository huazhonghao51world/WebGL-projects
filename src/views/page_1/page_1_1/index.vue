<style lang="scss" scoped>
// 公共样式
.box-main-content {
  width: 100%;
  height: 100%;
}

.suggestions-container {
  flex: 1;
  overflow-y: auto;
  // padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 16, 30, 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(45, 154, 222, 0.5);
    border-radius: 2px;

    &:hover {
      background: rgba(45, 154, 222, 0.7);
    }
  }
}

.factory-btn {
  width: 100%;
  height: 3rem;
  font-size: var(--font-size-16);
  font-weight: bold;
  margin-top: 1rem;
}

//最好加起来等于87
// 1540
.content-left {
  .park-target-quantity-left {
    height: 95%;
  }

  .stat-cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.4rem;
    box-sizing: border-box;
  }
}

.content-right {
  .camera-status-right {
    height: 95%;

    .box-main-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1rem 0.8rem 1rem 0.8rem;
    }
  }

  .header-right-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.5rem;
    background: linear-gradient(
      135deg,
      rgba(139, 116, 88, 0.6),
      rgba(139, 116, 88, 0.3)
    );
    border-radius: 0.3rem;
    cursor: pointer;
    transition: all 0.3s ease;

    span {
      font-size: var(--font-size-12);
      color: #ffe5b1;
      font-family: var(--font-family-primary-Regular);
      letter-spacing: 0.1rem;
      line-height: 1;
    }

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(139, 116, 88, 0.8),
        rgba(139, 116, 88, 0.5)
      );
      border-color: rgba(139, 116, 88, 1);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(139, 116, 88, 0.4);

      span {
        color: rgba(238, 248, 253, 1);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.sec-box-wrapper {
  margin-top: 0.9rem;
}

.data-cards-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 0.6rem 0;

  :deep(.data-card) {
    flex: 1;
    min-width: 0;
  }
}
</style>

<template>
  <Layout :aside="true">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="park-target-quantity-left" :delayTime="100" position="left">
          <template v-slot:header>
            <h1 class="box-header-txt">集团总览</h1>
          </template>

          <div class="box-main-content">
            <!-- 数据统计 -->
            <div class="stat-cards-grid">
              <DataStatCard
                v-for="item in statCards"
                :key="item.title"
                :title="item.title"
                :icon="item.icon"
                :value="item.value"
                :unit="item.unit"
              />
            </div>

            <!-- 风险与异常 -->
            <div class="sec-box-wrapper">
              <SecBox>
                <template v-slot:header>
                  <span> 风险与异常</span>
                </template>

                <div class="data-cards-container">
                  <WorkshopTable
                    :columns="riskColumns"
                    :tableData="riskData"
                    :headerColor="'#9BF8FF'"
                    rowBg="rgba(224, 233, 233, 0.1)"
                    cusHeight="3.52rem"
                  />
                </div>
              </SecBox>
            </div>
            <!-- 资源与成本 -->
            <div class="sec-box-wrapper">
              <SecBox>
                <template v-slot:header>
                  <span> 资源与成本</span>
                </template>

                <div class="data-cards-container">
                  <DataCard
                    v-for="item in dataList"
                    :key="item.label"
                    :icon="item.icon"
                    :label="item.label"
                    :value="item.value"
                    :unit="item.unit"
                    :isSmallFont="true"
                  />
                </div>
              </SecBox>
            </div>

            <!-- 合规与可持续 -->
            <div class="sec-box-wrapper">
              <SecBox>
                <template v-slot:header>
                  <span>合规与可持续</span>
                </template>
                <div class="data-cards-container">
                  <DataCard
                    v-for="item in complianceList"
                    :key="item.label"
                    :icon="item.icon"
                    :label="item.label"
                    :value="item.value"
                    :unit="item.unit"
                    :isSmallFont="true"
                  />
                </div>
              </SecBox>
            </div>

            <!-- 多基地对比 -->
            <div class="sec-box-wrapper">
              <SecBox>
                <template v-slot:header>
                  <span> 多基地对比</span>
                </template>

                <div class="data-cards-container">
                  <multiBaseComparison
                    :columns="planColumns"
                    :tableData="planData"
                    :headerColor="'#9BF8FF'"
                    rowBg="rgba(224, 233, 233, 0.1)"
                  />
                </div>
              </SecBox>
            </div>
          </div>
        </Box>
      </div>
    </template>

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="camera-status-right" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>诊断与建议</h1>
          </template>

          <template v-slot:header-right>
            <div class="header-right-btn">
              <span>关键结论</span>
            </div>
          </template>

          <div class="box-main-content">
            <div class="suggestions-container">
              <SuggestionCard
                v-for="(item, index) in suggestionList"
                :key="index"
                :label="item.label"
                :content="item.content"
              />
            </div>

            <!-- <el-button type="primary" class="factory-btn" @click="goToFactory">
              进入工厂
            </el-button> -->
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
import DataStatCard from "@/components/card/dataStatCard.vue";
import DataCard from "@/components/card/data-card.vue";
import SuggestionCard from "./components/suggestion-card.vue";
import WorkshopTable from "@components/table/workshopTable.vue"; 
import multiBaseComparison from "./components/multiBaseComparison.vue"; 


import wdpMixin from "./mixins/wdpapi";

export default {
  name: "FrontEndIndex",

  components: {
    Layout,
    Box,
    SecBox,
    DataStatCard,
    DataCard,
    SuggestionCard,
    WorkshopTable,
    multiBaseComparison
  },
  mixins: [wdpMixin],
  data() {
    return {
      statCards: [
        {
          title: "在制订单",
          icon: require("@/assets/images/page_1_1/zzdd.png"),
          value: 4,
          unit: "单",
        },
        {
          title: "准时交付率",
          icon: require("@/assets/images/page_1_1/zsjfl.png"),
          value: 97,
          unit: "%",
        },
        {
          title: "一次合格率",
          icon: require("@/assets/images/page_1_1/ychgl.png"),
          value: 99,
          unit: "%",
        },
        {
          title: "集团OEE",
          icon: require("@/assets/images/page_1_1/jtoee.png"),
          value: 87,
          unit: "%",
        },
      ],
      planColumns: [
        { key: "base", label: "基地", flex: 1.5 },
        { key: "output", label: "产量", flex: 0.9 },
        { key: "oee", label: "OEE", flex: 1 },
        { key: "qualified", label: "一次合格率", flex: 1. },
      ],
      riskColumns: [
        { key: "type", label: "类型", flex: 0.9, type: "risk" },
        { key: "target", label: "对象", flex: 1, type: "leftColumn" },
        { key: "desc", label: "说明", flex: 1.68, type: "leftColumn" },
      ],
      riskData: [
        {
          type: "设备",
          target: "陕西 CNC#3、\n河南试验台#1",
          desc: "服役超10年，MTBF下降，\n建议纳入技改/检修",
        },
        {
          type: "交期",
          target: "西北基地",
          desc: "订单超载，\n建议向华中转移或前段协同",
        },
        {
          type: "库存",
          target: "陕西液压元件",
          desc: "安全库存告警，\n建议补库或调拨",
        },
      ],
      planData: [
        {
          base: "山西基地",
          output: "8.2", 
          oee: "88%",
          qualified: "99.2%",
        },
        {
          base: "陕西基地",
          output: "6.5", 
          oee: "84%",
          qualified: "98.5%",
        },
        {
          base: "河南基地",
          output: "5.8", 
          oee: "86%",
          qualified: "99.0%",
        },
      ],
      dataList: [
        {
          icon: "在册人数",
          label: "在册人数",
          value: "5,320",
          unit: "人",
        },
        {
          icon: "年度总耗能",
          label: "年度总耗能",
          value: "31.5",
          unit: "GWh",
        },
        {
          icon: "能耗金额",
          label: "能耗金额",
          value: "2,180",
          unit: "万",
        },
      ],
      complianceList: [
        {
          icon: "累计无事故",
          label: "累计无事故",
          value: "428",
          unit: "天",
        },
        {
          icon: "隐患闭环率",
          label: "隐患闭环率",
          value: "98",
          unit: "%",
        },
        {
          icon: "产值能耗",
          label: "产值能耗",
          value: "0.048",
          unit: "",
        },
      ],
      suggestionList: [
        {
          label: "经营",
          content:
            "西北基地产能吃紧，建议订单向华中转移或前段协同；关注准时交付率与一次合格率趋势。",
        },
        {
          label: "风险",
          content:
            "陕西 CNC#3、河南试验台#1 需纳入本季度技改/检修；陕西液压元件、河南密封件库存告警，建议补库或调拨。",
        },
        {
          label: "资源",
          content:
            "年度能耗与双碳指标在控；关键技能岗位覆盖不足，建议培训与跨厂调配。",
        },
        {
          label: "合规",
          content:
            "累计无事故天数 428 天，隐患闭环率 98%；持续加强一线安全文化与行为规范。",
        },
        {
          label: "对标",
          content:
            "各基地 OEE 与质量存在差异，陕西基地一次合格率有提升空间，建议对标山西/河南最佳实践。",
        },
      ],
    };
  },
  computed: {},
  async mounted() {},

  methods: {
    goToFactory() {
      this.$router.push("/page_2/1");
    },
  },

  async beforeDestroy() {},
};
</script>
