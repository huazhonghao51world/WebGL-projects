<template>
  <Layout :aside="true">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box-item box-1" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>设备状态</h1>
          </template>
          <div class="box-main-content">
            <div class="stat-cards-grid">
              <DataStatCard v-for="item in statCards" :key="item.title" :title="item.title" :icon="item.icon"
                :value="item.value" :unit="item.unit" />
            </div>
            <SecBox>
              <template v-slot:header>
                <span>基础信息</span>
              </template>

              <div class="device-info">
                {{ deviceInfo }}
              </div>
            </SecBox>
          </div>
        </Box>

        <Box class="box-item box-2" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>主轴与伺服轴</h1>
          </template>
          <div class="box-main-content">
            <AxisParams :mainAxisParams="mainAxisParams" :servoAxisParams="servoAxisParams" />
          </div>
        </Box>

        <Box class="box-item box-3" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>近期报警</h1>
          </template>
          <div class="box-main-content">
            <WorkshopTable :columns="alarmColumns" :tableData="alarmData" :headerColor="'#9BF8FF'" :cusHeight="'2rem'"
               />
          </div>
        </Box>

        <Box class="box-item box-4" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>设备控制</h1>
          </template>
          <div class="box-main-content">
            <DeviceControl
              @mode-confirm="onModeConfirm"
              @mode-stop="onModeStop"
              @param-confirm="onParamConfirm"
              @param-reset="onParamReset"
            />
          </div>
        </Box>
      </div>
    </template>

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box-item box-1" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>诊断与建议</h1>
          </template>
          <div class="box-main-content box-right-main">
            <SecBox class="rul-sec">
              <template v-slot:header>
                <span>RUL 预期</span>
              </template>

              <div class="rul-text">零构件剩余使用寿命与当前状态，是否建议维护</div>
              <div class="rul-table-wrapper" @click="onRulTableClick">
                <WorkshopTable :columns="rulColumns" :tableData="rulData" :headerColor="'#9BF8FF'" headerBg="rgba(224, 233, 233,0.1)" :cusHeight="'2rem'"
                  />
              </div>
            </SecBox>
            <SecBox class="assistant-sec">
              <template v-slot:header>
                <span>大模型助手</span>
              </template>

              <AiAssistantPanel
                class="assistant-panel"
                :deviceLabel="deviceLabel"
                :deviceContext="aiContext"
                :selectedPart="selectedRulPart"
                :rulData="rulData"
                @select-part="onAiSelectPart"
              />

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
import AxisParams from "./components/axis-params.vue";
import DeviceParams from "./components/device-params.vue";
import DeviceControl from "./components/device-control.vue";
import DataStatCard from '@/components/card/dataStatCard.vue';
import WorkshopTable from '@/components/table/workshopTable.vue';
import AiAssistantPanel from "./components/AiAssistantPanel.vue";
import { fetchDeviceDetail, fetchDeviceRul, assembleContext } from "./api/lighthouse.js";
import wdpapi from "./mixins/wdpapi.js";

const DEFAULT_DEVICE_ID = 1

export default {
  name: "Page_2_5_Device",
  mixins: [wdpapi],
  components: {
    Layout,
    Box,
    SecBox,
    AxisParams,
    DeviceParams,
    DeviceControl,
    DataStatCard,
    WorkshopTable,
    AiAssistantPanel,
  },
  data() {
    return {
      // ── 设备 ID（路由参数，有默认值） ──────────────────────────
      deviceId: DEFAULT_DEVICE_ID,

      // ── AI context 缓存（每次轮询后更新） ─────────────────────
      aiContext: null,

      // ── 面板展示数据（占位，API 成功后覆盖） ────────────
      deviceInfo: '未连接',
      deviceLabel: '设备(未连接)',
      statCards: [
        { title: '当班OEE', icon: require('@/assets/images/page_2_5/OEE.png'), value: '-', unit: '%' },
        { title: '今日运行时间', icon: require('@/assets/images/page_2_5/time.png'), value: '-', unit: 'H' },
        { title: '今日加工件数', icon: require('@/assets/images/page_2_5/processing.png'), value: '-', unit: '件' },
        { title: '近7日报警', icon: require('@/assets/images/page_2_5/warn.png'), value: '-', unit: '' },
      ],
      alarmColumns: [
        { key: 'time', label: '时间', flex: 1.5 },
        { key: 'code', label: '代码', flex: 1 },
        { key: 'desc', label: '描述', flex: 1.5 },
        { key: 'isResolved', label: '已处理', flex: 1, type: 'status-yes-no' },
      ],
      alarmData: [
        { time: '-', code: '-', desc: '未连接', isResolved: '-' },
      ],
      rulColumns: [
        { key: 'part', label: '零构件', flex: 1.5 },
        { key: 'rul', label: '使用寿命/RUL', flex: 1.5 },
        { key: 'status', label: '当前状态', flex: 1 },
        { key: 'needMaintain', label: '是否建议维护', flex: 1.5, type: 'status-yes-no' },
      ],
      rulData: [
        { part: '未连接', rul: '-', status: '-', needMaintain: '-', eid: [] },
      ],
      selectedRulEid: [],
      selectedRulPart: null, // 当前选中的零部件完整信息（预留给后续功能使用）
      crystalActive: false,
      jcAnimating: true, // 机床动画是否正在播放（默认播放模式一）
      mainAxisParams: [
        { label: '转速(rpm)', value: '-', unit: '' },
        { label: '负载率(%)', value: '-', unit: '' },
        { label: '温度(℃)', value: '-', unit: '' },
      ],
      servoAxisParams: [
        { axis: 'X', position: { value: '-', unit: 'mm' }, load: { value: '-', unit: '%' }, precision: { value: '-', unit: 'mm' } },
        { axis: 'Y', position: { value: '-', unit: 'mm' }, load: { value: '-', unit: '%' }, precision: { value: '-', unit: 'mm' } },
        { axis: 'Z', position: { value: '-', unit: 'mm' }, load: { value: '-', unit: '%' }, precision: { value: '-', unit: 'mm' } },
      ],
    };
  },
  computed: {},
  watch: {
    // 报警数据变化后重新测量并启动滚动动画
    alarmData: {
      handler() {
        this.setupAlarmScroll();
      },
      deep: true,
    },
  },
  async mounted() {
    // 从路由参数读取 deviceId，无则用默认值
    const routeId = this.$route?.query?.deviceId || this.$route?.params?.deviceId
    if (routeId) this.deviceId = Number(routeId)

    // 立即触发一次滚动（使用初始 mock 数据，不等 API）
    this.setupAlarmScroll()
    // Box 有 200ms 延迟渲染，再补几次，确保 DOM 就绪后能绑定 hover
    setTimeout(() => this.setupAlarmScroll(), 300)
    setTimeout(() => this.setupAlarmScroll(), 800)

    // 立即拉取一次，然后每分钟轮询
    await this.loadDeviceData()
    this._pollTimer = setInterval(this.loadDeviceData, 60000)
  },
  methods: {
    async loadDeviceData() {
      try {
        const [detailRes, rulRes] = await Promise.all([
          fetchDeviceDetail(this.deviceId),
          fetchDeviceRul(this.deviceId),
        ])
        const detail = detailRes?.data ?? detailRes
        const rulList = rulRes?.data ?? rulRes

        // 缓存 AI context（每次对话都取最新值）
        this.aiContext = assembleContext(detail, rulList)

        // ── 用真实数据更新面板 ──────────────────────────
        if (detail) {
          const b = detail.basicInfo || {}
          this.deviceInfo = [
            b.deviceName,
            b.model ? `型号 ${b.model}` : '',
            b.location ? `位置：${b.location}` : '',
            b.productLine,
          ].filter(Boolean).join(' · ')

          this.deviceLabel = b.deviceName || '设备'

          this.statCards[0].value = detail.deviceOEE
          this.statCards[1].value = detail.runtime
          this.statCards[2].value = detail.todayOutput
          this.statCards[3].value = detail.last7DaysAlarms

          if (Array.isArray(detail.alarmRecords)) {
            this.alarmData = detail.alarmRecords.map(a => ({
              time: a.time ?? '',
              code: a.code ?? '',
              desc: a.description ?? '',
              isResolved: a.handled ? '是' : '否',
            }))
          }

          // 主轴与伺服轴
          const rp = detail.runtimeParams
          if (rp) {
            this.mainAxisParams = [
              { label: '转速(rpm)', value: rp.spindleSpeed, unit: '' },
              { label: '负载率(%)', value: rp.spindleLoad, unit: '' },
              { label: '温度(℃)', value: rp.spindleTemp, unit: '' },
            ]
            if (Array.isArray(rp.axisPositions)) {
              this.servoAxisParams = rp.axisPositions.map(a => ({
                axis: a.axis,
                position: { value: a.pos, unit: 'mm' },
                load: { value: a.load, unit: '%' },
                precision: { value: a.error, unit: 'mm' },
              }))
            }
          }
        }

        if (Array.isArray(rulList) && rulList.length) {
          this.rulData = rulList.map(r => ({
            part: r.component,
            rul: `${r.rul}h`,
            status: `${r.health}%`,
            needMaintain: r.recommend ? '是' : '否',
            eid: Array.isArray(r.eid) ? r.eid : (r.eid ? [r.eid] : []),
          }))
        }
      } catch (e) {
        // API 失败时静默降级，保持页面现有 mock 数据不变
        console.warn('[lighthouse] loadDeviceData failed:', e.message)
      }
      this.setupAlarmScroll();
    },
    /** 检测报警描述列溢出，设置滚动动画 */
    setupAlarmScroll() {
      this.$nextTick(() => {
        const cells = this.$el.querySelectorAll('.box-3 .table-cell:nth-child(3)');
        cells.forEach(cell => {
          const inner = cell.querySelector('.common');
          if (!inner) return;

          // hover 监听只绑一次，无条件绑定（内部实时测量）
          if (!cell._marqueeHoverBound) {
            cell.addEventListener('mouseenter', () => {
              const ov = inner.offsetWidth - cell.clientWidth;
              if (ov <= 2) return;
              const d = (2 + ov * 0.04).toFixed(2);
              inner.style.setProperty('--scroll-dist', `-${ov}px`);
              inner.style.animation = 'none';
              void inner.offsetWidth; // 强制回流以重启动画
              inner.style.animation = `marquee-scroll ${d}s linear infinite`;
            });
            cell._marqueeHoverBound = true;
          }

          // 首次/数据变化后自动启动
          inner.style.animation = 'none';
          const overflow = inner.offsetWidth - cell.clientWidth;
          if (overflow > 2) {
            const duration = (2 + overflow * 0.04).toFixed(2);
            inner.style.setProperty('--scroll-dist', `-${overflow}px`);
            requestAnimationFrame(() => {
              inner.style.animation = `marquee-scroll ${duration}s linear infinite`;
            });
          } else {
            inner.style.removeProperty('--scroll-dist');
          }
        });
      });
    },
    /** 模式确认 → 播放对应动画 */
    onModeConfirm(animationIndex) {
      this.controlJC(true, animationIndex);
      this.jcAnimating = true;
    },
    /** 模式停止 → 停止动画 */
    onModeStop() {
      this.controlJC(false);
      this.jcAnimating = false;
    },
    /** 参数指令确认 → 控制机床轴百分比位移 */
    onParamConfirm({ x, y, z }) {
      this.controlJCAxisPercent(x, y, z);
    },
    /** 参数指令复位 → 控制机床轴复位百分比 */
    onParamReset({ x, y, z }) {
      this.controlJCAxisPercent(x, y, z);
    },
    async onRulTableClick(e) {
      const rowEl = e.target.closest('.table-row');
      if (!rowEl) return;
      const rows = Array.from(rowEl.parentElement.children);
      const index = rows.indexOf(rowEl);
      const row = this.rulData[index];
      if (!row) return;
      this.selectRulPart(row);
    },
    /** 来自 AI 聊天链接：按零件名找到行并选中 */
    onAiSelectPart(partName) {
      if (!partName) return;
      const row = this.rulData.find(r => r && r.part === partName);
      if (!row) return;
      this.selectRulPart(row);
    },
    /**
     * 选中（或切换/取消）某零件，统一入口
     * 同一零件 → 取消选中；不同零件 → 切换到新选中
     */
    selectRulPart(row) {
      const eid = row?.eid || [];
      const rowsEls = this.$el.querySelectorAll('.rul-table-wrapper .table-row');

      const isSameRow = this.selectedRulEid.length === eid.length
        && eid.every(e => this.selectedRulEid.includes(e));

      if (isSameRow) {
        // ── 取消选中 ──
        if (this.selectedRulEid.length) {
          this.controlHighLight(this.selectedRulEid, false);
        }
        this.selectedRulEid = [];
        this.selectedRulPart = null;
        rowsEls.forEach(r => r.classList.remove('rul-selected'));
        if (this.crystalActive) {
          this.controlCrystal(false);
          this.crystalActive = false;
        }
      } else {
        // ── 切换到新行 ──
        if (this.selectedRulEid.length) {
          this.controlHighLight(this.selectedRulEid, false);
        }
        rowsEls.forEach(r => r.classList.remove('rul-selected'));
        this.selectedRulEid = [...eid];
        this.selectedRulPart = { ...row };
        // 给对应 DOM 行加选中样式
        const idx = this.rulData.indexOf(row);
        if (idx >= 0 && rowsEls[idx]) rowsEls[idx].classList.add('rul-selected');

        if (eid.length) {
          this.focusToEntities(eid);
          if (!this.crystalActive) {
            this.controlCrystal(true);
            this.crystalActive = true;
          }
          this.controlHighLight(eid, true);
        }
      }
    },
  },
  async beforeDestroy() {
    clearInterval(this._pollTimer)
    try {
      // 离开页面时，取消所有高亮
      if (this.selectedRulEid.length) {
        await this.controlHighLight(this.selectedRulEid, false);
        this.selectedRulEid = [];
      }
      // 离开页面时，如果水晶体还开着就关掉
      if (this.crystalActive) {
        await this.controlCrystal(false);
        this.crystalActive = false;
      }
      // 离开页面时，如果动画还在播放就停止
      if (this.jcAnimating) {
        await this.controlJC(false);
        this.jcAnimating = false;
      }
    } catch (e) {
      console.warn('[page_2_5] beforeDestroy cleanup failed:', e.message || e);
    }
  },
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
}

.content-left {
  .box-1 {
    height: 29%; // 调整高度以容纳两部分内容
  }

  .box-2 {
    height: 21%;
  }

  .box-3 {
    height: 13%;

    // 近期报警 - 描述列单行显示，滚动动画由 JS 动态触发
    :deep(.table-row) {
      .table-cell:nth-child(3) {
        overflow: hidden !important;
        word-break: normal !important;
        justify-content: flex-start !important;  // 文字靠左起始，避免居中导致左侧裁剪

        .common {
          white-space: nowrap !important;
          display: inline-block !important;
        }
      }
    }
  }

  .box-4 {
    height: 21.5%;
  }
}

.content-right {
  .box-1 {
    height: 98%;

    .box-right-main {
      display: flex;
      flex-direction: column;
      height: 100%;

      .rul-sec {
        height: 35%;
        display: flex;
        flex-direction: column;

        .rul-text {
          font-size: var(--font-size-12);
          color: rgba(238, 248, 253, 0.7);
          margin-bottom: 0.8rem;
          padding-left: 0.5rem;
        }

        .rul-table-wrapper {
          flex: 1;
          overflow: hidden;

          :deep(.table-row) {
            cursor: pointer;
            transition: background-color 0.2s;

            // 选中态
            &.rul-selected {
              background-color: rgba(155, 248, 255, 0.1) !important;
            }
          }
        }
      }

      .assistant-sec {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;

        // 仅限 assistant-sec 内的 SecBox：需要 flex 高度链传递给 AiAssistantPanel
        :deep(.sec-box) {
          min-height: 0;
        }

        :deep(.sec-box-content) {
          min-height: 0; // 覆盖 SecBox 默认值，打通 flex 高度链
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      }

      .assistant-panel {
        height: 100%;
        min-height: 0;
      }
    }
  }
}

.device-info {
  font-size: var(--font-size-12);
  color: var(--color-primary);
  font-family: var(--font-family-primary-Regular);
  line-height: 1.6;
  padding: 0.5rem 0.8rem;
  margin-bottom: 0.5rem;
}

.stat-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>

<!-- 全局 keyframes（不能被 scoped 重命名，否则 JS inline animation 引用不到） -->
<style>
@keyframes marquee-scroll {
  0%, 15%   { transform: translateX(0); }
  85%, 100% { transform: translateX(var(--scroll-dist, 0)); }
}
</style>
