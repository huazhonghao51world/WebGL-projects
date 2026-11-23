<!--
  工厂能源管理（page_2_6）主页面
  =============================================================
  设计稿对齐版（v1.2）
  - 基础数据：energyData mixin 提供 overview / plans
  - 仿真流程：simulation mixin 提供 SSE 状态机（run）
  - 场景联动：wdpapi mixin（发电设施 / 变压器 POI）

  布局（Layout 三栏）
  - aside-left-tools: LeftToolbar（发电设施 / 变压器）
  - aside-left: 工厂能耗管控
      · KPI 总览 / 能耗与碳排 / 负荷曲线 / 用能结构 / 车间分解
  - aside-right: 研判 / 验策 / AI 建议
      · 调控预案 / 验策仿真（含曲线对比） / 物理 AI 建议
-->
<template>
  <Layout :aside="true" :main="true">
    <!-- 左下相机视角工具栏：5 个能源设施视角 + 2 个底部占位按钮 -->
    <template v-slot:aside-left-tools>
      <div class="energy-camera-toolbar">
        <button
          v-for="tool in cameraTools"
          :key="tool.key"
          type="button"
          class="energy-camera-tool"
          :class="{ 'is-active': tool.isActive }"
          @click="handleCameraToolClick(tool)"
        >
          <img :src="tool.icon" :alt="tool.label" class="energy-camera-tool__icon" />
          <span class="energy-camera-tool__label">{{ tool.label }}</span>
        </button>

        <div class="energy-camera-toolbar__footer">
          <button
            v-for="tool in cameraAuxTools"
            :key="tool.key"
            type="button"
            class="energy-camera-tool energy-camera-tool--icon-only"
            :class="{ 'is-active': tool.isActive }"
            :aria-label="tool.label"
            :title="tool.label"
            @click="handleCameraAuxToolClick(tool)"
          >
            <img :src="tool.icon" :alt="tool.label" class="energy-camera-tool__icon" />
          </button>
        </div>
      </div>
    </template>

    <!-- ============ 左栏 ============ -->
    <template v-slot:aside-left>
      <div class="content-left">
        <!-- 单一 Box 包裹（无外层大标题，设计稿中只有 3 个子模块标题栏） -->
        <Box class="box-full" :delayTime="100" position="left">
          <div class="box-main-content fixed-partition">
            <!-- 此刻总览（KPI + 全日负荷曲线） -->
            <CollapseSection
              class="sec-overview"
              title="此刻总览"
              scope-tag-class="primary"
              :no-collapse="true"
              title-size="1rem"
            >
              <OverviewKpi :overview="overviewKpiData" />
            </CollapseSection>

            <!-- 用能结构 + Top 损失 -->
            <CollapseSection class="sec-structure" title="用能结构" :no-collapse="true" title-size="1rem">
              <Structure
                :structure="overview.energyStructure || []"
                @select="onLossSelect"
              />
            </CollapseSection>

            <!-- 能耗与碳排（6 指标 2×3 卡片） -->
            <CollapseSection class="sec-microgrid" title="供能与微网" :no-collapse="true" title-size="1rem">
              <Microgrid :data="microgrid" />
            </CollapseSection>

            <!-- 峰谷·成本·碳（6 指标 2×3 卡片） -->
            <CollapseSection class="sec-carbon" title="峰谷·成本·碳" :no-collapse="true" title-size="1rem">
              <Carbon :data="carbonData" />
            </CollapseSection>

            <!-- 异常与风险（统计 + 趋势 + 最高关注 + 列表） -->
            <CollapseSection class="sec-loss" title="异常与风险" :no-collapse="true" title-size="1rem">
              <template v-slot:tools>
                <span v-if="topLossData.stats" class="risk-total-badge">{{ topLossData.stats.total }}</span>
              </template>
              <Loss
                :data="topLossData"
                @select="onLossSelect"
              />
            </CollapseSection>
          </div>
        </Box>

        <!-- 全局加载/错误提示 -->
        <div v-if="energyError.overview" class="page-error left">
          数据加载失败：{{ energyError.overview }}
          <button type="button" @click="refreshEnergyData">重试</button>
        </div>
      </div>
    </template>

    <!-- ============ 右栏 ============ -->
    <template v-slot:aside-right>
      <div class="content-right">
        <!-- 单一 Box（无外层大标题，验策仿真作为 CollapseSection 提供渐变标题） -->
        <Box class="box-full" :delayTime="100" position="right">
          <div class="box-main-content has-action">
            <!-- 滚动区 -->
            <div class="scroll-area">
              <!-- 验策仿真（大标题 = 渐变背景图，与左栏 3 个同级） -->
              <CollapseSection class="capability-panel-section" title="能力模块" :no-collapse="true" title-size="1rem">
                <!-- 能力模块选择：当前仅“能源验测”可用，其余模块先占位禁用 -->
                <div class="capability-module-selector">
                  <el-select
                    v-model="selectedCapabilityModule"
                    class="capability-module-select"
                    popper-class="capability-module-popper"
                    :popper-append-to-body="true"
                  >
                    <el-option
                      v-for="item in capabilityModuleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      :disabled="item.disabled"
                    />
                  </el-select>
                </div>

                <!-- 子模块 1：推荐方案（plain 标题：无背景 + 顶部紫横条） -->
                <template v-if="isEnergyVerifyModule">
                <CollapseSection title="推荐方案" :plain="true" :no-collapse="true" title-size="1rem">
                  <PlanList
                    :plans="energyPlans || []"
                    :selected-id="selectedPlanId"
                    @select="onPlanSelect"
                  />
                </CollapseSection>

                <!-- 子模块 2：参数配置（已并入“供电策略”内容：并网/峰段购电） -->
                <CollapseSection title="策略配置" :plain="true" :no-collapse="true" title-size="1rem">
                  <VerifyPane
                    section="params"
                    :form="verifyForm"
                    :storage-dis-max="storageDisMax"
                    :sim-state="simState"
                    @change="markSimDirty"
                    @update:form="onFormUpdate"
                  />
                  <VerifyPane
                    section="grid"
                    :form="verifyForm"
                    :storage-dis-max="storageDisMax"
                    :sim-state="simState"
                    @change="markSimDirty"
                    @update:form="onFormUpdate"
                  />
                </CollapseSection>

                <!-- 仿真操作：呈现配置影响仅保留视觉占位；运行按钮沿用原仿真逻辑 -->
                <div class="simulation-actions">
                  <button
                    type="button"
                    class="simulation-action-btn"
                    :class="{ callout: sceneImpactVisible }"
                    @click="onTogglePresentImpact"
                  >
                    <span>呈现配置影响</span>
                  </button>
                  <button
                    type="button"
                    class="simulation-action-btn"
                    :class="{ callout: simState.dirty || !simState.hasResult }"
                    :disabled="simState.running"
                    @click="onRunSim"
                  >
                    <span>{{ simState.running ? "仿真中…" : "运行孪生仿真" }}</span>
                  </button>
                </div>

                <!-- 子模块 4：仿真结果对比（不需二级标题装饰横线） -->
                <CollapseSection :plain="true" :no-collapse="true" :no-separator="true">
                  <template v-slot:title>
                    <span style="color: #9bf8ff; font-size: 0.875rem; font-family: var(--font-family-primary-Medium); letter-spacing: 0.02em;">仿真结果对比</span>
                  </template>
                  <VerifyPane
                    section="result"
                    :form="verifyForm"
                    :storage-dis-max="storageDisMax"
                    :sim-state="simState"
                  >
                    <template v-slot:chart>
                      <LoadCurveChart
                        :base-curve="overview.loadCurve || []"
                        :before-curve="simBeforeCurve"
                        :after-curve="simAfterCurve"
                        :show-compare="simState.hasResult"
                        :show-pv="true"
                        height="8rem"
                        :font-scale="2.2"
                      />
                    </template>
                  </VerifyPane>
                </CollapseSection>

                <!-- 子模块 5：AI建议（原型为顶部标题 + 下方滚动内容，无需外层 plain 标题） -->
                <AiSuggestion
                  class="ai-block"
                  :content="simState.aiContent"
                  :answering="simState.aiAnswering"
                />
                </template>

                <!-- 其余能力模块：内容来自数据驱动的能力模块面板，模块下拉由本页 el-select 接管 -->
                <CapabilityPanel
                  v-else
                  class="capability-panel-embed"
                  :modules="capabilityModules"
                  :value="selectedCapabilityModule"
                  :icons="assistantIcons"
                  :hide-module-select="true"
                />

              </CollapseSection>
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

// 子组件
import CollapseSection from "./components/collapse-section.vue";
import OverviewKpi from "./components/overview-kpi.vue";
import Structure from "./components/structure.vue";
import Loss from "./components/loss.vue";
import Carbon from "./components/carbon.vue";
import Microgrid from "./components/microgrid.vue";
import VerifyPane from "./components/verify-pane.vue";
import PlanList from "./components/plan-list.vue";
import AiSuggestion from "./components/ai-suggestion.vue";
import LoadCurveChart from "./components/load-curve-chart.vue";
import CapabilityPanel from "./components/capability/CapabilityPanel.vue";
import capabilityModules, { assistantIcons } from "./data/moduleConfig.js";

// mixins
import energyData from "./mixins/energyData";
import simulation from "./mixins/simulation";
import wdpapi from "./mixins/wdpapi.js";
import wdpapiW from "./mixins/wdpapi-w.js";

const ENERGY_VERIFY_MODULE = "energy_verify";

export default {
  name: "Page_2_6",
  mixins: [energyData, simulation, wdpapi, wdpapiW],
  components: {
    Layout,
    Box,
    CollapseSection,
    OverviewKpi,
    Structure,
    Loss,
    Microgrid,
    Carbon,
    VerifyPane,
    PlanList,
    AiSuggestion,
    LoadCurveChart,
    CapabilityPanel,
  },

  data() {
    return {
      capabilityModules,
      assistantIcons,
      /** 当前能力模块：ENERGY_VERIFY_MODULE 为本页原有的能源验测，其余取 moduleConfig 的模块 id */
      selectedCapabilityModule: ENERGY_VERIFY_MODULE,
      capabilityModuleOptions: [
        { label: "能源验测", value: ENERGY_VERIFY_MODULE },
        ...capabilityModules.map((m) => ({ label: m.name, value: m.id })),
      ],

      /** 当前选中的方案对象（来自 plans 列表点击） */
      selectedPlan: null,

      /**
       * 验策表单
       * - 字段命名与接口请求体保持一致（plans 也用同名字段，便于 applyPlan 直接 spread）
       * - storagePeakOut 是 0~100 的 slider 值，storagePeakMw 由 storageDisMax 计算
       * - 默认值：储能峰放 0、车间移峰 0、空气策略 节能优化(opt)、并网策略 并网优先(normal)、峰段购电 正常购电(normal)
       */
      verifyForm: {
        storagePeakOut: 0,
        airStrategy: "opt",
        workshopShift: 0,
        gridMode: "normal",
        buyMode: "normal",
        pvMode: "online",
        dieselMode: "auto",
        purchaseType: "grid",
        regionMix: "wind",
      },

      /** 左下能源设施按钮：toolId 对应 wdpapi 的 toolData/toolHandlers，isActive 为激活态 */
      cameraTools: [
        { key: "air", label: "空压", toolId: 1, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/air.svg") },
        { key: "pv", label: "光伏", toolId: 5, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/pv.svg") },
        { key: "transformer", label: "变电", toolId: 2, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/transformer.svg") },
        { key: "generation", label: "发电", toolId: 3, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/generation.svg") },
        { key: "storage", label: "储能", toolId: 6, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/storage.svg") },
      ],
      /** 原型底部两个 32×32 图标按钮：点击切换场景热力图显隐（heatMapId 对应 ControlHeatMap 的 Id） */
      cameraAuxTools: [
        { key: "electricity", label: "电力", heatMapId: 1, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/electricity.svg") },
        { key: "co2", label: "碳排", heatMapId: 0, isActive: false, icon: require("@/assets/images/page_2_6/camera-toolbar/co2.svg") },
      ],

      /** 厂区 ID（接口必传，优先取路由 query.factoryId） */
      factoryId: Number(this.$route?.query?.factoryId) || 1,

      /** 场景高亮显隐开关：由“呈现配置影响”按钮控制，方案/参数不再自动点亮 */
      sceneImpactVisible: false,
    };
  },

  computed: {
    /** 是否为本页原生的“能源验测”流程（否则渲染 CapabilityPanel） */
    isEnergyVerifyModule() {
      return this.selectedCapabilityModule === ENERGY_VERIFY_MODULE;
    },

    /** 安全 overview 引用 */
    overview() {
      return this.energyOverview || {};
    },

    /** KPI 卡片用的总览数据（注入 priceTier 以方便子组件取） */
    overviewKpiData() {
      const o = this.overview;
      const peak = (o.carbon && o.carbon[0]) || {};
      return {
        ...o,
        priceTier: peak.priceTier,
      };
    },

    /** 峰谷成本（取首条） */
    carbonData() {
      return (this.overview.carbon && this.overview.carbon[0]) || {};
    },

    /** 微电网（取首条） */
    microgrid() {
      return (this.overview.microgrids && this.overview.microgrids[0]) || {};
    },

    /** 异常与风险（统计 / 趋势 / 最高关注 / 列表） */
    topLossData() {
      return this.overview.topLosses || {};
    },

    /** 储能可放电功率上限（MW，verify-pane 与微电网共享）
     * 业务希望划条范围固定 0~2.0 MW，接口返回值不足 2.0 时以 2.0 兑底
     */
    storageDisMax() {
      const apiVal = Number(this.microgrid.storageDisMax) || 0;
      return Math.max(apiVal, 2.0);
    },

    /** 当前表单计算出的储能峰放（MW） */
    storagePeakMw() {
      const max = Math.max(0.01, this.storageDisMax);
      const pct = Math.max(
        0,
        Math.min(100, Number(this.verifyForm.storagePeakOut) || 0)
      );
      return Math.min(max, (pct / 100) * max);
    },

    /** 选中方案 id（plan-list 高亮用） */
    selectedPlanId() {
      return this.selectedPlan ? this.selectedPlan.id : null;
    },

    /** 仿真前曲线（来自 simulate_result.curves.beforeCurve） */
    simBeforeCurve() {
      const r = this.simState.result;
      return (r && r.curves && r.curves.beforeCurve) || [];
    },

    /** 仿真后曲线（来自 simulate_result.curves.afterCurve） */
    simAfterCurve() {
      const r = this.simState.result;
      return (r && r.curves && r.curves.afterCurve) || [];
    },
  },

  async mounted() {
    // 加载能源总览 + 方案列表
    await this.refreshEnergyData();

    // // 2. 自动选中推荐方案（或第一条）
    // if (Array.isArray(this.energyPlans) && this.energyPlans.length) {
    //   const recommended =
    //     this.energyPlans.find((p) => p.recommended) || this.energyPlans[0];
    //   this.applyPlan(recommended);
    // }
  },

  watch: {
    async selectedCapabilityModule(moduleId) {
      if (moduleId === ENERGY_VERIFY_MODULE) {
        await this.clearModuleSceneW();
        await this.closeAll();
        return;
      }
      await this.clearEnergyVerifyScene();
      await this.applyModuleSceneW(moduleId);
    },
  },

  methods: {
    /** 离开「能源验测」时清空它在场景里留下的全部效果，避免与能力模块场景叠加 */
    async clearEnergyVerifyScene() {
      this.cameraTools.forEach((t) => {
        t.isActive = false;
      });
      await this.resetCameraAuxTools();

      this.sceneImpactVisible = false;
      this.hideAllPlanSceneCoverings();
      this.resetSimImprovedTargetsToNormal([]);

      await this.closeAll();
    },

    /**
     * 应用一个方案：把方案参数同步到 verifyForm，并联动场景高亮
     */
    applyPlan(plan) {
      if (!plan) return;
      this.selectedPlan = plan;
      this.verifyForm = {
        storagePeakOut:
          plan.storagePeakOut != null ? Number(plan.storagePeakOut) : 50,
        airStrategy: plan.airStrategy || "opt",
        workshopShift:
          plan.workshopShift != null ? Number(plan.workshopShift) : 0,
        gridMode: plan.gridMode || "normal",
        buyMode: plan.buyMode || "normal",
        pvMode: plan.pvMode || "online",
        dieselMode: plan.dieselMode || "auto",
        purchaseType: plan.purchaseType || "grid",
        regionMix: plan.regionMix || "wind",
      };
      // 标记需要重新仿真（保留旧 result 让用户对比，但 badge 会变"待验证"）
      this.markSimDirty();
      // 切方案：清除旧仿真结果的场景染色/围栏（成果需重新验策）
      if (typeof this.resetSimImprovedTargetsToNormal === "function") {
        this.resetSimImprovedTargetsToNormal([]);
      }
      // 仅当“呈现配置影响”开启时才实时联动场景高亮
      if (this.sceneImpactVisible && typeof this.highlightPlanPois === "function") {
        this.highlightPlanPois(plan);
      }
    },

    /**
     * 构造仿真请求体（对齐接口文档：factoryId/planId/pois/.../buyMode）
     */
    buildSimBody() {
      const f = this.verifyForm;
      return {
        factoryId: this.factoryId,
        planId: this.selectedPlan ? this.selectedPlan.id : null,
        pois: (this.selectedPlan && this.selectedPlan.pois) || [],
        storagePeakOut: Number(f.storagePeakOut) || 0,
        storagePeakMw: Number(this.storagePeakMw.toFixed(3)),
        airStrategy: f.airStrategy,
        workshopShift: Number(f.workshopShift) || 0,
        gridMode: f.gridMode,
        buyMode: f.buyMode,
        pvMode: f.pvMode,
        dieselMode: f.dieselMode,
        purchaseType: f.purchaseType,
        regionMix: f.regionMix,
      };
    },

    // ============ 事件处理 ============

    /** 默认参数配置（进入页面 / 取消方案时使用） */
    getDefaultVerifyForm() {
      return {
        storagePeakOut: 0,
        airStrategy: "opt",
        workshopShift: 0,
        gridMode: "normal",
        buyMode: "normal",
        pvMode: "online",
        dieselMode: "auto",
        purchaseType: "grid",
        regionMix: "wind",
      };
    },

    /** 选择方案（再次点击已选中项则取消选中） */
    onPlanSelect(plan) {
      if (!plan) {
        this.selectedPlan = null;
        // 重置为默认参数配置
        this.verifyForm = this.getDefaultVerifyForm();
        if (this.sceneImpactVisible && typeof this.highlightPlanPois === "function") {
          this.highlightPlanPois(null);
        }
        return;
      }
      this.applyPlan(plan);
    },

    /** verify-pane 表单更新（slider/select 改动） */
    onFormUpdate(newForm) {
      this.verifyForm = newForm;
      // 用户手动修改参数 → 取消当前方案选中态（保留参数值，不重置）
      if (this.selectedPlan) {
        this.selectedPlan = null;
      }
      // 仅当“呈现配置影响”开启时才实时刷新场景高亮
      if (this.sceneImpactVisible && typeof this.refreshFormSceneCoverings === "function") {
        this.refreshFormSceneCoverings();
      }
    },

    /** 呈现配置影响：切换场景高亮显隐（开启时按当前方案+表单+仿真结果实时联动） */
    onTogglePresentImpact() {
      this.sceneImpactVisible = !this.sceneImpactVisible;
      if (this.sceneImpactVisible) {
        if (typeof this.refreshFormSceneCoverings === "function") {
          this.refreshFormSceneCoverings();
        }
        // 已有仿真结果时同步联动仿真状态色（与方案联动一致，均由本按钮控制）
        const improvement = this.simState.result && this.simState.result.improvement;
        if (improvement && typeof this.applySimulationImprovementToScene === "function") {
          this.applySimulationImprovementToScene(improvement);
        }
      } else {
        if (typeof this.hideAllPlanSceneCoverings === "function") {
          this.hideAllPlanSceneCoverings();
        }
        // 同步清除仿真状态色残留
        if (typeof this.resetSimImprovedTargetsToNormal === "function") {
          this.resetSimImprovedTargetsToNormal([]);
        }
      }
    },

    /** 运行孪生仿真 */
    onRunSim() {
      // if (!this.selectedPlan) {
      //   this.$message && this.$message.warning("请先选择调控预案");
      //   return;
      // }
      const body = this.buildSimBody();
      this.runSimulation(body);
    },

    /** 损失 / 车间 → 联动场景 POI（传整个 loss 对象，让 wdpapi 用 loss.lossWindow 覆盖弹窗内容） */
    onLossSelect(loss) {
      if (loss && loss.poi && typeof this.selectPoiByApiId === "function") {
        this.selectPoiByApiId(loss);
      }
    },

    /** 左下设施按钮：与其他页面工具栏一致走 wdpapi（创建 POI/弹窗/围栏），支持再次点击取消。 */
    async handleCameraToolClick(tool) {
      const toolId = Number(tool?.toolId);
      if (!toolId) return;

      // 切换激活态：当前项取反，其余复位（对齐 handleToolSelect）
      const nextActive = !tool.isActive;
      this.cameraTools.forEach((t) => {
        t.isActive = Number(t.toolId) === toolId ? nextActive : false;
      });
      // 与底部辅助按钮全局互斥：复位并隐藏其热力图
      await this.resetCameraAuxTools();
      await this.clearModuleSceneW();

      if (typeof this.closeAll === "function") {
        await this.closeAll();
      }

      if (!nextActive) return;

      const handler = this.toolHandlers?.[toolId];
      const data = this.toolData?.[toolId];
      if (typeof handler === "function" && data) {
        await handler(data, toolId);
      }
    },

    /** 复位底部辅助按钮：清除激活态并隐藏其已显示的热力图。 */
    async resetCameraAuxTools(exceptKey) {
      for (const t of this.cameraAuxTools) {
        if (t.key === exceptKey) continue;
        if (t.isActive) {
          t.isActive = false;
          if (typeof this.controlHeatMap === "function") {
            await this.controlHeatMap(t.heatMapId, 0);
          }
        }
      }
    },

    /** 底部辅助按钮：切换场景热力图显隐（Alpha 1=显示 / 0=隐藏），与全部按钮互斥。 */
    async handleCameraAuxToolClick(tool) {
      if (!tool || tool.heatMapId == null) return;
      const nextActive = !tool.isActive;

      // 与其他按钮全局互斥：复位另一个辅助按钮、设施按钮并清理场景（保留当前相机视角）
      await this.resetCameraAuxTools(tool.key);
      await this.clearModuleSceneW();
      this.cameraTools.forEach((t) => {
        t.isActive = false;
      });
      if (typeof this.closeAll === "function") {
        await this.closeAll(false);
      }

      tool.isActive = nextActive;
      if (typeof this.controlHeatMap === "function") {
        await this.controlHeatMap(tool.heatMapId, nextActive ? 1 : 0);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* ===== 左下能源设施相机视角工具栏 =====
   原型：主按钮 84×32，纵向间距 3px；底部两个按钮 32×32，水平间距 4px。 */
.energy-camera-toolbar {
  width: 5.25rem; /* 84px @ 1920 */
  display: flex;
  flex-direction: column;
  gap: 0.1875rem; /* 3px */
}

.energy-camera-tool {
  width: 5.25rem;
  height: 2rem;
  flex: 0 0 2rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.625rem;
  padding: 0 0.625rem;
  border-radius: 0.125rem;
  border: 1px solid rgba(167, 209, 255, 0.2);
  background:
    linear-gradient(90deg, rgba(172, 181, 190, 0.4031) 0%, rgba(172, 181, 190, 0.0966) 100%),
    rgba(12, 21, 43, 0.5);
  box-sizing: border-box;
  color: #fff;
  font-family: var(--font-family-primary-Regular);
  font-size: var(--font-size-14);
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, opacity 0.18s ease;

  &:hover {
    border-color: rgba(167, 209, 255, 0.32);
  }

  &.is-active {
    border-color: rgba(155, 248, 255, 0.8);
    background:
      linear-gradient(90deg, rgba(70, 127, 255, 0.55) 0%, rgba(70, 127, 255, 0.12) 100%),
      rgba(12, 21, 43, 0.5);
  }
}

.energy-camera-tool__icon {
  position: static !important;
  left: auto !important;
  width: 1rem;
  height: 1rem;
  flex: 0 0 1rem;
  object-fit: contain;
  opacity: 0.7;
  pointer-events: none;
}

.energy-camera-tool__label {
  font-size: var(--font-size-14);
  color: #fff;
  white-space: nowrap;
  pointer-events: none;
}

.energy-camera-toolbar__footer {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px */
}

.energy-camera-tool--icon-only {
  width: 2rem;
  flex-basis: 2rem;
  justify-content: center;
  padding: 0;

  .energy-camera-tool__icon {
    opacity: 1;
  }
}

/* ===== Box 内容容器 ===== */
.box-main-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 左栏（方案2 固定分区）：整体不滚动，三块各占固定高度，底部永远齐平 */
  &.fixed-partition {
    overflow: hidden;
  }

  /* 右栏：含粘底按钮，禁止外层滚动 */
  &.has-action {
    overflow: hidden;
  }
}

/* ===== 左栏固定分区（方案2：仿 bak，三块按比例瓜分整列高度） =====
   - 用 flex-grow 比例分配：三块之和恒等于 100%，底部永远齐平
     （固定百分比 40/28/29=97% 会留 ~1 屏%+padding 的缝，故改用 flex 比例）
   - 每个 CollapseSection 变成 flex 列：标题栏固定高 + body 占满剩余
   - body 内部可滚动兜底（内容偶尔超出时不会撑破整块） */
.box-main-content.fixed-partition {
  .collapse-section {
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* 覆盖子组件的 flex-shrink:0：留作安全网，内容偶尔超高时整体自适应、底部恒齐平 */
    flex-shrink: 1;
    margin-bottom: 0.3rem;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    /* 标题栏固定高度，不被压缩 */
    ::v-deep .section-head {
      flex-shrink: 0;
    }

    /* body 占满该块剩余空间；内容超出时内部滚动兜底 */
    ::v-deep .section-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  /* 三块高度比例（参考 bak：38.3 / 25.2 / 24.2）。
     flex-grow 会把整列高度按比例瓜分 → 和恒为 100%，底部齐平。
     flex-basis:0 → 完全由比例决定，忽略内容自然高度。 */
  .sec-overview {
    flex: 16 1 0;
  }
  .sec-structure {
    flex: 9 1 0;
  }
  .sec-microgrid {
    flex: 16 1 0;
  }
  .sec-carbon {
    flex: 9.5 1 0;
  }
  .sec-loss {
    flex: 30 1 0;

    ::v-deep .risk-total-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.1rem;
      height: 1.1rem;
      padding: 0 0.28rem;
      border-radius: 0.55rem;
      background: #f5493d;
      color: #fff;
      font-size: var(--font-size-14);
      font-family: var(--font-family-primary-Bold);
      line-height: 1;
    }
  }
}

/* ===== 右栏能力模块下拉 =====
   设计稿：340×32（父面板 364 宽）；当前位置由 Box + 能力模块 section-body 的
   既有左右内边距自然形成约 12px 边距，不再额外写绝对定位。 */
.capability-module-selector {
  width: 100%;
  height: 2rem;
  margin-bottom: 0.75rem; /* 下拉栏与“推荐方案”保留约 20px 的视觉间距（含下级标题自身上内边距） */
  flex-shrink: 0;
}

.capability-module-select {
  width: 100%;

  ::v-deep .el-input,
  ::v-deep .el-input__inner {
    height: 2rem;
    line-height: 2rem;
  }

  ::v-deep .el-input__inner {
    padding: 0 2rem 0 0.6875rem;
    border-radius: 0.125rem;
    background: rgba(40, 51, 70, 0.8);
    border: 1px solid rgba(207, 231, 255, 0.2);
    color: rgba(238, 248, 253, 0.9);
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);
    box-sizing: border-box;
  }

  ::v-deep .el-input__suffix {
    right: 0.35rem;
  }

  ::v-deep .el-select__caret {
    width: 1.25rem;
    color: rgba(207, 231, 255, 0.68);
    font-size: var(--font-size-10);
    line-height: 2rem;
  }
}

/* 右栏滚动区：占满剩余空间，自身滚动 */
.scroll-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 右栏：让“验策仿真”主块撑满可视高度，底部按钮贴底，避免底部留白 */
.content-right .scroll-area > .collapse-section {
  flex: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ::v-deep .section-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding-bottom: 0.12rem;
    /* 外层 Box 才是能力模块主边框。这里直接命中实际根 section-body，
       隐藏内层 1px 边框但保留其占位，避免出现第二圈边框。 */
    border-color: transparent !important;
  }
}

.inset-caption {
  margin: 0.12rem 0 0;
  font-size: var(--font-size-12);
  color: rgba(238, 248, 253, 0.4);
  font-family: var(--font-family-primary-Regular);
  line-height: 1.3;
  letter-spacing: 0.02em;
}

/* ===== 仿真操作按钮：位于策略配置与“仿真结果对比”之间 ===== */
.simulation-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.1rem 0.5rem;
  padding: 0 0.4rem; /* 对齐策略配置下拉框：plain body 0.1rem + row margin 0.3rem */
  box-sizing: border-box;
}

.simulation-action-btn {
  position: relative;
  width: 9.375rem; /* 150px @ 1920 */
  height: 2rem; /* 32px @ 1920 */
  flex: 0 1 9.375rem;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid rgba(116, 126, 137, 0.4013);
  border-radius: 0;
  background:
    linear-gradient(90deg, rgba(118, 219, 226, 0.318) 0%, rgba(118, 219, 226, 0) 32%, rgba(118, 219, 226, 0) 67%, rgba(118, 219, 226, 0.322) 100%) center 0.5625rem / 100% 0.5625rem no-repeat,
    linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(5, 94, 241, 0) 32%, rgba(5, 92, 236, 0) 67%, rgba(255, 255, 255, 0.16) 100%) center 0.875rem / 100% 0.5625rem no-repeat,
    rgba(5, 94, 241, 0.3041);
  color: #fff;
  font-family: var(--font-family-primary-Regular);
  font-size: var(--font-size-14);
  font-weight: 400;
  line-height: 0.75rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;

  span {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    line-height: 0.75rem;
    font-size: inherit;
  }


  &:hover:not(:disabled),
  &:active:not(:disabled) {
    background:
      linear-gradient(90deg, #08efff 0%, rgba(118, 219, 226, 0) 32%, rgba(118, 219, 226, 0) 67%, #08efff 100%) center 0.5625rem / 100% 0.5625rem no-repeat,
      linear-gradient(90deg, #fff 0%, rgba(5, 94, 241, 0) 32%, rgba(5, 92, 236, 0) 67%, #fff 100%) center 0.875rem / 100% 0.5625rem no-repeat,
      rgba(5, 94, 241, 0.7);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* callout 仅保留状态类，不再额外绘制外圈，避免运行按钮出现双重边框。 */
  &.callout {
    box-shadow: none;
  }
}

/* AI 建议：保持原型 340×142，本身不再通过 margin/transform 调整底部间距。 */
.ai-block {
  margin: 0.45rem 0 0.2rem;
}

.content-right .ai-block {
  flex: 0 0 8.875rem;
  min-height: 8.875rem;
  height: 8.875rem;
}

/* 内嵌能力模块面板：撑满“能力模块”section-body 剩余空间 */
.capability-panel-embed {
  flex: 1;
  min-height: 0;
}

/* ===== 单一 Box 占满：左右栏统一 ===== */
.content-left,
.content-right {
  position: relative;
  height: 100%;

  /* 本页不使用 Box 顶部标题栏，不使用 Box 内部暗色面板背景
     全部透出 3D 场景，仅依靠 CollapseSection 标题栏作为分隔 */
  &.content-left ::v-deep .header-container,
  &.content-right ::v-deep .header-container {
    display: none;
  }

  /* Box 自身：占满父级高度，去除默认 margin-bottom（避免下方按钮被推出可视区） */
  ::v-deep .box {
    height: 100%;
    margin-bottom: 0 !important;
    display: flex;
    flex-direction: column;
  }
  ::v-deep .box-main {
    flex: 1;
    min-height: 0;
    background: transparent !important;
    border: none !important;
    padding: 0 0.3rem !important;
  }

  /* ★ 字号本地化（关键修复）
     ----------------------------------------------------------------
     【根因】src/assets/css/main.scss 全局规则：
        span { font-size: var(--font-size-22); }   ← 22px @1920
        h2  { font-size: var(--font-size-32); }    ← 32px
        h3  { font-size: var(--font-size-28); }    ← 28px
     本页面大量使用 <span class="label/value/chip">，被全局 span 选择
     器直接命中（优先级覆盖父级继承），导致字号被强制拉大。

     【方案】在本页作用域内重定义"超大字号"变量为更小值，让全局
     span / h* 规则跟着变小。仍用 rem，由 html { font-size: 0.83vw }
     驱动 → 既小又随浏览器分辨率自动缩放。
     
     字号映射（rem 数值 × 0.83vw → 1920 下的 px）：
        0.5625rem = 9px   辅助 / scope-tag
        0.625rem  = 10px  正文 / sub
        0.75rem   = 12px  标题 / 数据
        0.875rem  = 14px  KPI 数字
        1rem      = 16px  Box header / h1
  */
  /* 重定义影响 span / h* 的"巨大"全局字号 */
  --font-size-32: 0.875rem;  /* h2: 32→14 */
  --font-size-28: 0.75rem;   /* h3 / en-title: 28→12 */
  --font-size-24: 0.75rem;   /* span.tag: 24→12 */
  --font-size-22: 0.75rem;   /* span 默认: 22→12 ★ 关键 */
  --font-size-20: 0.75rem;   /* span.table: 20→12 */
  /* --font-size-16/14/12/10 保持原值（本身就是 PRD 期望字号） */

  .box-full {
    height: 100%;
  }
}

/* 设计稿右侧能力面板：只保留 Box 这一层主边框。
   bottom padding 直接形成 AI 建议与面板底边的真实留白，不再依赖会被 flex/overflow 吃掉的 margin。 */
.content-right ::v-deep .box-main {
  background: rgba(12, 21, 43, 0.5) !important;
  border: 1px solid rgba(167, 209, 255, 0.2) !important;
  border-radius: 0.125rem;
  padding: 0 0.3rem 0.75rem !important;
}

/* page2_6 各模块标题统一按原型：OPPOSans / 16px / 26px / normal。 */
.content-left ::v-deep .collapse-section > .section-head .section-title,
.content-right ::v-deep .collapse-section > .section-head .section-title {
  font-family: var(--font-family-primary-Regular) !important;
  font-size: var(--font-size-16) !important;
  font-weight: 400 !important;
  line-height: 1.625rem !important;
  letter-spacing: 0.01em !important;
  color: #f6ffff !important;
}

/* ===== 错误兜底 ===== */
.page-error {
  position: absolute;
  bottom: 0.4rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
  font-size: var(--font-size-10);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 5;

  button {
    background: rgba(248, 113, 113, 0.2);
    border: 1px solid rgba(248, 113, 113, 0.5);
    color: #f87171;
    padding: 0.1rem 0.3rem;
    border-radius: 0.15rem;
    cursor: pointer;
    font-size: var(--font-size-10);
    font-family: inherit;
  }
}

/* 本页专属：左/右面板统一 top=7%、height=90%，因此底边都是 3%；
   左下 toolbar 本身也固定 bottom=3%，三者底边完全对齐。 */
::v-deep .layout-aside-left,
::v-deep .layout-aside-right {
  height: 90%;
}

::v-deep .layout-aside-left-tools {
  bottom: 3%;
}
</style>

<!-- el-select 下拉菜单默认 teleport 到 body，需用唯一 popper-class 做本页视觉覆盖 -->
<style lang="scss">
.capability-module-popper.el-select-dropdown {
  margin-top: 0.25rem;
  border-radius: 0.125rem;
  background: rgba(12, 21, 43, 0.96);
  border: 1px solid rgba(167, 209, 255, 0.2);
  box-shadow: 0 0.35rem 1rem rgba(0, 0, 0, 0.35);

  .el-select-dropdown__list {
    padding: 0.2rem 0;
  }

  .el-select-dropdown__item {
    position: relative;
    height: 2rem;
    line-height: 2rem;
    padding: 0 0.6875rem;
    color: rgba(238, 248, 253, 0.72);
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Regular);

    /* Element UI 的 el-option 会在 li 内再包一层 span。项目全局 span=22px，
       必须显式覆盖这一层，否则展开菜单仍会被放大。 */
    > span {
      font-size: var(--font-size-12) !important;
      font-family: var(--font-family-primary-Regular);
    }

    &.hover,
    &:hover {
      background: rgba(61, 158, 255, 0.12);
      color: rgba(238, 248, 253, 0.95);
    }

    /* 当前生效的模块：仅底色区分，重新展开时一眼可辨 */
    &.selected {
      color: #9bf8ff;
      font-family: var(--font-family-primary-Medium);
      background: rgba(155, 248, 255, 0.14);

      > span {
        font-family: var(--font-family-primary-Medium);
      }

      &.hover,
      &:hover {
        color: #9bf8ff;
        background: rgba(155, 248, 255, 0.2);
      }
    }

    &.is-disabled {
      color: rgba(238, 248, 253, 0.3);
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }
  }

  .popper__arrow,
  .popper__arrow::after {
    border-bottom-color: rgba(12, 21, 43, 0.96) !important;
  }
}
</style>
