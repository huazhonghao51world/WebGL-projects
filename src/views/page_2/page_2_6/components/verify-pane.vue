<!--
  验策仿真（设计稿对齐版 v1.2）
  =============================================================
  纵向单列布局 - 3 个模块：
    1. 参数配置：储能峰放 / 车间移峰（双列 slider）+ 空气策略（单行 select）
    2. 供电策略：并网策略 / 峰段购电策略（双列 select）
    3. 仿真结果对比：3 数值卡（市电峰段/绿电自用率/并网峰值）+ 曲线对比图
  底部：运行孪生仿真（紫色 CTA，左对齐）
-->
<template>
  <div class="verify-pane">
    <!-- ============ 1. 参数配置 ============ -->
    <div v-if="showSection('params')" class="pane-block params-block">

      <!-- 储能峰放 + 车间移峰（双列 slider，复用 page_2_5_device 的图片拖拽组件） -->
      <div class="row-2">
        <div class="cell">
          <div class="cell-label">
            <span>储能峰放</span>
            <span class="val-text">{{ storagePeakMw.toFixed(2) }} MW</span>
          </div>
          <image-slider
            :value="Number(form.storagePeakOut) || 0"
            :min="0"
            :max="100"
            @input="onSliderChange('storagePeakOut', $event)"
          />
        </div>
        <div class="cell">
          <div class="cell-label">
            <span>车间移峰</span>
            <span class="val-text">{{ form.workshopShift }}%</span>
          </div>
          <image-slider
            :value="Number(form.workshopShift) || 0"
            :min="0"
            :max="30"
            @input="onSliderChange('workshopShift', $event)"
          />
        </div>
      </div>

      <!-- 空气策略（单行 select） -->
      <div class="cell">
        <div class="cell-label">
          <span>空气策略</span>
        </div>
        <div class="custom-select" :class="{ open: openSelect === 'airStrategy' }">
          <div class="select-trigger" @click="toggleSelect('airStrategy')">
            <span>{{ getOptionLabel('airStrategy', form.airStrategy) }}</span>
            <span class="select-arrow">▼</span>
          </div>
          <div v-show="openSelect === 'airStrategy'" class="select-dropdown">
            <div
              v-for="opt in airOptions"
              :key="opt.value"
              class="select-option"
              :class="{ active: form.airStrategy === opt.value }"
              @click="selectOption('airStrategy', opt.value)"
            >{{ opt.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 2. 供电策略 ============ -->
    <div v-if="showSection('grid')" class="pane-block grid-block">
      <div class="row-2">
        <div class="cell">
          <div class="cell-label">
            <span>并网策略</span>
          </div>
          <div class="custom-select" :class="{ open: openSelect === 'gridMode' }">
            <div class="select-trigger" @click="toggleSelect('gridMode')">
              <span>{{ getOptionLabel('gridMode', form.gridMode) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div v-show="openSelect === 'gridMode'" class="select-dropdown">
              <div
                v-for="opt in gridModeOptions"
                :key="opt.value"
                class="select-option"
                :class="{ active: form.gridMode === opt.value }"
                @click="selectOption('gridMode', opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="cell-label">
            <span>峰段购电策略</span>
          </div>
          <div class="custom-select" :class="{ open: openSelect === 'buyMode' }">
            <div class="select-trigger" @click="toggleSelect('buyMode')">
              <span>{{ getOptionLabel('buyMode', form.buyMode) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div v-show="openSelect === 'buyMode'" class="select-dropdown">
              <div
                v-for="opt in buyModeOptions"
                :key="opt.value"
                class="select-option"
                :class="{ active: form.buyMode === opt.value }"
                @click="selectOption('buyMode', opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 场内光伏 / 备用柴发（双列 select） -->
      <div class="row-2">
        <div class="cell">
          <div class="cell-label">
            <span>场内光伏</span>
          </div>
          <div class="custom-select" :class="{ open: openSelect === 'pvMode' }">
            <div class="select-trigger" @click="toggleSelect('pvMode')">
              <span>{{ getOptionLabel('pvMode', form.pvMode) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div v-show="openSelect === 'pvMode'" class="select-dropdown">
              <div
                v-for="opt in pvModeOptions"
                :key="opt.value"
                class="select-option"
                :class="{ active: form.pvMode === opt.value }"
                @click="selectOption('pvMode', opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="cell-label">
            <span>备用柴发</span>
          </div>
          <div class="custom-select" :class="{ open: openSelect === 'dieselMode' }">
            <div class="select-trigger" @click="toggleSelect('dieselMode')">
              <span>{{ getOptionLabel('dieselMode', form.dieselMode) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div v-show="openSelect === 'dieselMode'" class="select-dropdown">
              <div
                v-for="opt in dieselModeOptions"
                :key="opt.value"
                class="select-option"
                :class="{ active: form.dieselMode === opt.value }"
                @click="selectOption('dieselMode', opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购电配置（购电形式 + 区域来源，双列 select） -->
      <div class="cell">
        <div class="cell-label">
          <span>购电配置</span>
        </div>
        <div class="row-2">
          <div class="custom-select" :class="{ open: openSelect === 'purchaseType' }">
            <div class="select-trigger" @click="toggleSelect('purchaseType')">
              <span>{{ getOptionLabel('purchaseType', form.purchaseType) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div v-show="openSelect === 'purchaseType'" class="select-dropdown">
              <div
                v-for="opt in purchaseTypeOptions"
                :key="opt.value"
                class="select-option"
                :class="{ active: form.purchaseType === opt.value }"
                @click="selectOption('purchaseType', opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
          <div class="custom-select" :class="{ open: openSelect === 'regionMix' }">
            <div class="select-trigger" @click="toggleSelect('regionMix')">
              <span>{{ getOptionLabel('regionMix', form.regionMix) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div v-show="openSelect === 'regionMix'" class="select-dropdown">
              <div
                v-for="opt in regionMixOptions"
                :key="opt.value"
                class="select-option"
                :class="{ active: form.regionMix === opt.value }"
                @click="selectOption('regionMix', opt.value)"
              >{{ opt.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 3. 仿真结果对比 ============ -->
    <div v-if="showSection('result')" class="pane-block result-block">

      <!-- 峰值对比头：现策略峰值 → 验策后峰值 -->
      <div class="peak-head">
        <div class="peak-item">
          <div class="peak-label">现策略峰值</div>
          <div class="peak-val">{{ improvement.peakBefore }}<span class="unit">Mw</span></div>
        </div>
        <div class="peak-arrow">⟶</div>
        <div class="peak-item">
          <div class="peak-label">验策后峰值</div>
          <div class="peak-val hl">{{ improvement.peakAfter }}<span class="unit">Mw</span></div>
        </div>
      </div>

      <!-- 5 指标：峰值降幅 / 绿电自用率 / 储能执行 / 加权碳因子 / 外购碳排降幅 -->
      <div class="metric-row5">
        <div class="metric-cell5">
          <div class="m5-label">峰值降幅</div>
          <div class="m5-body">
            <div class="m5-value" :class="improvement.peakTone">{{ improvement.peakPct }}</div>
            <div class="m5-sub">{{ improvement.peakRange }}</div>
          </div>
        </div>
        <div class="metric-cell5">
          <div class="m5-label">绿电自用率</div>
          <div class="m5-body">
            <div class="m5-value" :class="improvement.greenTone">{{ improvement.greenPct }}</div>
            <div class="m5-sub">较现策略</div>
          </div>
        </div>
        <div class="metric-cell5">
          <div class="m5-label">储能执行</div>
          <div class="m5-body">
            <div class="m5-value">{{ improvement.storageExec }}</div>
            <div class="m5-sub">{{ improvement.storageSub }}</div>
          </div>
        </div>
        <div class="metric-cell5">
          <div class="m5-label">加权碳因子</div>
          <div class="m5-body">
            <div class="m5-value">{{ improvement.carbonFactor }}</div>
            <div class="m5-sub">{{ improvement.carbonFactorSub }}</div>
          </div>
        </div>
        <div class="metric-cell5">
          <div class="m5-label">外购碳排降幅</div>
          <div class="m5-body">
            <div class="m5-value" :class="improvement.carbonTone">{{ improvement.carbonDropPct }}</div>
            <div class="m5-sub">{{ improvement.carbonRange }}</div>
          </div>
        </div>
      </div>

      <!-- 曲线对比图（外部传入子组件渲染） -->
      <div class="chart-slot">
        <slot name="chart"></slot>
      </div>

      <!-- 错误兜底（仅失败时显示） -->
      <p v-if="simState.error" class="sim-error">
        仿真失败：{{ simState.error }}
      </p>
    </div>

  </div>
</template>

<script>
import ImageSlider from "@/views/page_2/page_2_5_device/components/ImageSlider.vue";

const AIR_LABELS = {
  secure: "供气保障优先",
  opt: "节能优化",
  leak: "泄漏治理"
};

export default {
  name: "VerifyPane",
  components: { ImageSlider },
  props: {
    /** 表单：v-model:form */
    form: {
      type: Object,
      required: true
    },
    /** 储能可放电功率上限（MW） */
    storageDisMax: {
      type: Number,
      default: 2.0
    },
    /** simulation mixin 暴露的 simState */
    simState: {
      type: Object,
      default: () => ({
        running: false,
        dirty: true,
        hasResult: false,
        result: null,
        error: null
      })
    },
    /**
     * 只渲染哪一块："params" / "grid" / "result" / null
     * - null 或未传：三块全部渲染（向后兼容）
     * - 传了某个值：只渲染对应一块（供外层 CollapseSection plain 拆分使用）
     */
    section: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      /** 当前展开的下拉：'airStrategy' | 'gridMode' | 'buyMode' | null */
      openSelect: null,
      /** 下拉选项配置 */
      airOptions: [
        { value: "secure", label: "供气保障优先（不影响产线压力）" },
        { value: "opt", label: "节能优化（机组重排/压力微调）" },
        { value: "leak", label: "泄漏治理（生成维保待办）" }
      ],
      gridModeOptions: [
        { value: "normal", label: "并网优先（默认）" },
        { value: "limit", label: "限需量（削峰约束）" },
        { value: "smooth", label: "平滑爬坡（配合储能）" }
      ],
      buyModeOptions: [
        { value: "normal", label: "正常购电" },
        { value: "cap", label: "峰段限购" }
      ],
      pvModeOptions: [
        { value: "online", label: "参与自发自用" },
        { value: "offline", label: "离线（不出力）" }
      ],
      dieselModeOptions: [
        { value: "auto", label: "自动（承压时介入顶峰）" },
        { value: "on", label: "强制顶峰（增加柴油碳排）" },
        { value: "off", label: "禁用（仅屏储能/移峰削峰）" }
      ],
      purchaseTypeOptions: [
        { value: "grid", label: "市电购电" },
        { value: "retailer", label: "售电公司" },
        { value: "direct_line", label: "直连专线" }
      ],
      regionMixOptions: [
        { value: "wind", label: "风电" },
        { value: "pv", label: "光伏" },
        { value: "hydro", label: "水电" },
        { value: "thermal", label: "火电" },
        { value: "mixed", label: "区域综合" }
      ]
    };
  },
  computed: {
    /** 储能峰放 MW（受上限约束）：滑条 0~100 → 0~storageDisMax MW（默认 0~2.0） */
    storagePeakMw() {
      const max = Math.max(0.01, this.storageDisMax || 2.0);
      const pct = Math.max(0, Math.min(100, Number(this.form.storagePeakOut) || 0));
      return Math.min(max, (pct / 100) * max);
    },
    airStrategyLabel() {
      return AIR_LABELS[this.form.airStrategy] || this.form.airStrategy || "—";
    },
    /** 仿真结果对比：峰值头 + 5 指标（映射 simulate_result.result） */
    improvement() {
      const dash = {
        peakBefore: "—", peakAfter: "—",
        peakPct: "—", peakRange: "", peakTone: "neutral",
        greenPct: "—", greenTone: "neutral",
        storageExec: "—", storageSub: "",
        carbonFactor: "—", carbonFactorSub: "",
        carbonDropPct: "—", carbonRange: "", carbonTone: "neutral"
      };
      const r = this.simState.result;
      if (!r) return dash;
      const imp = r.improvement || {};
      const carbon = r.carbon || {};
      const ps = r.powerStructure || {};
      const storage = (r.facilities && r.facilities.storage) || {};
      const gen = (r.facilities && r.facilities.generator) || {};

      const num = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));
      const signed = (v, d, suffix) => {
        const n = num(v);
        if (n == null) return "—";
        return (n > 0 ? "+" : "") + n.toFixed(d) + suffix;
      };
      const plain = (v, d, suffix = "") => {
        const n = num(v);
        return n == null ? "—" : n.toFixed(d) + suffix;
      };
      const toneBySign = (v, goodWhenNegative) => {
        const n = num(v);
        if (n == null || n === 0) return "neutral";
        const favorable = goodWhenNegative ? n < 0 : n > 0;
        return favorable ? "good" : "bad";
      };

      // 峰值 before/after：由增量与百分比反推（after = before + Δ）
      const dMw = num(imp.peakGridDeltaMw);
      const dPct = num(imp.peakGridDeltaPct);
      let pBefore = null, pAfter = null;
      if (dMw != null && dPct) {
        pBefore = dMw / (dPct / 100);
        pAfter = pBefore + dMw;
      }

      // 储能执行主值：facilities.storage.pDisMaxKw(kW) → MW
      const storageExecKw = num(storage.pDisMaxKw);
      const genAssistMw = num(carbon.genAssistPeakMw) != null ? num(carbon.genAssistPeakMw) : num(gen.autoAssistMw);

      // 碳排方向：仿真 > 基准 = 上升(不利,红)
      const cBase = num(carbon.carbonBaseTons);
      const cSim = num(carbon.carbonSimTons);
      const carbonUp = cBase != null && cSim != null && cSim > cBase;

      return {
        peakBefore: pBefore == null ? "—" : pBefore.toFixed(1),
        peakAfter: pAfter == null ? "—" : pAfter.toFixed(1),
        // ① 峰值降幅（降为利，负值绿）
        peakPct: signed(imp.peakGridDeltaPct, 2, "%"),
        peakRange: pBefore == null ? "" : `${pBefore.toFixed(1)}→${pAfter.toFixed(1)} Mw`,
        peakTone: toneBySign(imp.peakGridDeltaPct, true),
        // ② 绿电自用率（只显示增量，升为利）
        greenPct: signed(imp.greenDeltaPct, 2, "pp"),
        greenTone: toneBySign(imp.greenDeltaPct, false),
        // ③ 储能执行（facilities.storage.pDisMaxKw → MW）
        storageExec: storageExecKw == null ? "—" : (storageExecKw / 1000).toFixed(2) + " Mw",
        storageSub: genAssistMw == null ? "" : `类发顶峰值 ${genAssistMw.toFixed(2)} MW`,
        // ④ 加权碳因子
        carbonFactor: plain(ps.carbonFactorWeighted != null ? ps.carbonFactorWeighted : carbon.externalFactor, 3),
        carbonFactorSub: `外购 ${plain(ps.carbonFactorExternal != null ? ps.carbonFactorExternal : carbon.externalFactor, 3)} · 低碳 ${plain(ps.greenEquivPct != null ? ps.greenEquivPct : carbon.greenEquivPct, 0, "%")}`,
        // ⑤ 外购碳排降幅（carbonDropPct 原样；着色按基准/仿真方向）
        carbonDropPct: signed(carbon.carbonDropPct, 2, "%"),
        carbonRange: cBase != null && cSim != null ? `${cBase.toFixed(2)}→${cSim.toFixed(2)} tCO₂` : "",
        carbonTone: carbonUp ? "bad" : "good"
      };
    }
  },
  methods: {
    /** 判断该块是否该渲染：未传 section 时全渲染；传了只渲染匹配的一块 */
    showSection(name) {
      return !this.section || this.section === name;
    },
    /**
     * ImageSlider 拖拽回调：直接接收数值（不是 event）
     * @param {String} key 表单字段名
     * @param {Number} value 新值
     */
    onSliderChange(key, value) {
      this.$emit("update:form", { ...this.form, [key]: Number(value) || 0 });
      this.$emit("change");
    },
    onSelectChange(key, e) {
      const value = e.target.value;
      this.$emit("update:form", { ...this.form, [key]: value });
      this.$emit("change");
    },
    /** 自定义下拉：切换展开/收起 */
    toggleSelect(name) {
      this.openSelect = this.openSelect === name ? null : name;
    },
    /** 自定义下拉：选中某项 */
    selectOption(key, value) {
      this.$emit("update:form", { ...this.form, [key]: value });
      this.$emit("change");
      this.openSelect = null;
    },
    /** 获取选项显示文本 */
    getOptionLabel(key, value) {
      const map = {
        airStrategy: this.airOptions,
        gridMode: this.gridModeOptions,
        buyMode: this.buyModeOptions,
        pvMode: this.pvModeOptions,
        dieselMode: this.dieselModeOptions,
        purchaseType: this.purchaseTypeOptions,
        regionMix: this.regionMixOptions
      };
      const opts = map[key] || [];
      const found = opts.find(o => o.value === value);
      return found ? found.label : value || "—";
    },
    /** 点击外部关闭下拉 */
    handleOutsideClick(e) {
      if (!this.$el.contains(e.target)) {
        this.openSelect = null;
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleOutsideClick);
  }
};
</script>

<style lang="scss" scoped>
.verify-pane {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* ============ 分块容器（仅作内边距容器，外层 CollapseSection 控制分隔） ============ */
.pane-block {
  padding: 0;
}

/* ============ 双列布局 ============ */
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.3rem;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 参数配置：储能峰放/车间移峰行 —— 离上边(标题)远一点、离下面(空气策略)近一点 */
.params-block .row-2 {
  gap: 2.4rem;
  margin: 0.3rem;
}

/* 空气策略（参数配置的直接子级 cell）：左右边距与上面那行对齐 */
.params-block > .cell {
  margin: 0.3rem;
}

/* 供电策略：并网策略/峰段购电策略行 —— 左右边距与参数配置对齐 */
.grid-block .row-2 {
  margin: 0.3rem;
}

/* 购电配置：整块左右边距与上面各行对齐；内部双列 select 贴合外层，不再叠加边距 */
.grid-block > .cell {
  margin: 0.3rem;
}
.grid-block > .cell > .row-2 {
  margin: 0;
}

.cell {
  // margin: 0 0.3rem;
  // margin-bottom: 0.25rem;

  /* select */
  select {
    width: 100%;
    padding: 0.25rem 0.3rem;
    border-radius: 0.18rem;
    border: 1px solid rgba(72, 120, 180, 0.3);
    background: rgba(40, 51, 70, 0.8);
    color: rgba(238, 248, 253, 0.95);
    font-size: var(--font-size-10);
    font-family: inherit;
    outline: none;
    cursor: pointer;

    &:hover {
      border-color: rgba(167, 139, 250, 0.5);
    }
  }

  /* 自定义下拉组件 */
  .custom-select {
    position: relative;
    width: 100%;

    .select-trigger {
      width: 100%;
      height: 2rem;
      padding: 0 0.6875rem;
      border-radius: 0.125rem;
      border: 1px solid rgba(207, 231, 255, 0.2);
      background: rgba(40, 51, 70, 0.8);
      color: rgba(238, 248, 253, 0.95);
      font-size: var(--font-size-12);
      line-height: 0.6875rem;
      font-family: var(--font-family-primary-Regular);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .select-trigger > span:first-child {
      font-size: var(--font-size-12) !important;
      line-height: 0.6875rem;
      color: #fff !important;
      font-family: var(--font-family-primary-Regular);
      font-weight: 400;
    }

    .select-arrow {
      font-size: 0.5rem;
      color: rgba(238, 248, 253, 0.6);
      transition: transform 0.2s;
    }

    &.open .select-arrow {
      transform: rotate(180deg);
    }

    .select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.08rem;
      border-radius: 0.18rem;
      border: 1px solid rgba(72, 120, 180, 1);
      background-color: rgba(56, 77, 103, 1);
      overflow: hidden;
      z-index: 100;
    }

    .select-option {
      padding: 0.25rem 0.3rem;
      font-size: var(--font-size-12);
      line-height: 0.6875rem;
      font-family: var(--font-family-primary-Regular);
      font-weight: 400;
      cursor: pointer;
      /* 未选中：#384D67 @ 60% */
      background-color: rgba(56, 77, 103, 0.6);
      color: rgba(238, 248, 253, 0.95);

      /* 选中：#467FFF @ 50% */
      &.active {
        background-color: rgba(70, 127, 255, 0.5);
        color: #fff;
      }

      /* 不写 :hover → 悬停不变色 */
    }
  }
}

.cell-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-12);
  color: #dbf5ff;
  font-family: var(--font-family-primary-Regular);
  font-weight: 400;
  margin-bottom: 0.18rem;
  line-height: 0.75rem;
  letter-spacing: 0;

  > span {
    font-size: var(--font-size-12) !important;
    color: #dbf5ff !important;
  }

  .val-text {
    color: #fff !important;
    font-family: var(--font-family-primary-Regular);
    font-size: var(--font-size-12) !important;
    font-weight: 400;
  }
}

.cell-hint {
  font-size: var(--font-size-10);
  color: rgba(238, 248, 253, 0.5);
  line-height: 1.4;
  margin-top: 0.15rem;
}

/* ============ 仿真结果对比 ============ */
.result-block {
  /* 峰值对比头：现策略 / 验策后 各自独立框，中间箭头 */
  .peak-head {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .peak-item {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.35rem 0.6rem;
    background: linear-gradient(90deg, rgba(23, 118, 238, 0.18), rgba(23, 118, 238, 0.04));
    border-radius: 0.2rem;
  }
  .peak-label {
    font-size: var(--font-size-12);
    color: #dbf5ff;
  }
  .peak-val {
    font-size: var(--font-size-20);
    font-family: var(--font-family-primary-Bold);
    color: #eef8fd;
    line-height: 1;
    .unit {
      font-size: var(--font-size-10);
      color: rgba(238, 248, 253, 0.6);
      margin-left: 0.1rem;
    }
    &.hl {
      color: #9bf8ff;
    }
  }
  .peak-arrow {
    font-size: var(--font-size-16);
    color: #9bf8ff;
    letter-spacing: -0.1em;
  }

  /* 5 指标网格 */
  .metric-row5 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.35rem;
    margin-bottom: 0.5rem;
  }
  .metric-cell5 {
    position: relative;
    min-height: 5rem;
    /* 蓝/灰高度由 label:body 的 flex 比例决定（不再用固定 50/50 背景图） */
    border-radius: 0.15rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .m5-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* 上部蓝色标题区 */
    background: linear-gradient(180deg, #2e5e97 0%, #244a78 100%);
    font-size: var(--font-size-10);
    color: rgba(238, 248, 253, 0.9);
    line-height: 1.2;
    white-space: nowrap;
  }
  .m5-body {
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* 下部灰色内容区 */
    background: rgba(26, 34, 48, 0.9);
    gap: 0.12rem;
    padding: 0 0.1rem;
    min-width: 0;
  }
  .m5-value {
    max-width: 100%;
    white-space: nowrap;
    font-size: var(--font-size-12);
    font-family: var(--font-family-primary-Bold);
    line-height: 1.2;
    letter-spacing: 0.02em;
    color: #9bf8ff;

    /* 仅不利值转红，其余保持青绿 */
    &.good,
    &.neutral {
      color: #9bf8ff;
    }
    &.bad {
      color: #f87171;
    }
  }
  .m5-sub {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-8);
    color: rgba(238, 248, 253, 0.45);
    line-height: 1.2;
  }
}

.chart-slot {
  min-height: 5.8rem;
}

.sim-error {
  margin-top: 0.25rem;
  padding: 0.2rem 0.35rem;
  border-radius: 0.18rem;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
  font-size: var(--font-size-10);
  line-height: 1.4;
}
</style>
