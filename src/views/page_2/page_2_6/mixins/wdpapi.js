// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";
import { toolDataMock, lossPoiDataMock } from "./MockData";

// 仿真结果状态色常量（按约定：有利=绿色，告警=琥珀）
const SCENE_TARGET_COLOR = {
  NORMAL: "rgba(22, 132, 184, 0.8)", // 常规蓝
  BENEFIT: "rgba(22, 163, 74, 0.58)", // 绿色
  WARNING: "rgba(245, 158, 11, 0.62)", // 琥珀
};

// 场景实体描边高亮样式（styleName + 十六进制颜色 #RRGGBBAA）
// - NORMAL：方案/参数联动的常规高亮（黄绿 YellowGreen）
// - BENEFIT：仿真结果利好（绿）
// - WARNING：仿真结果告警（琥珀）
const OUTLINE_STYLE = {
  NORMAL: { name: "MediumBlue", color: "#0000CD77" },
  BENEFIT: { name: "SpringGreen", color: "#00FF7F77" },
  WARNING: { name: "IndianRed", color: "#CD5C5C77" },
};

// 场景描边像素粗细
const OUTLINE_THICKNESS = 4;

// 场景目标 code -> 实体 eid 列表（通过 App.Scene.GetObjectEid 取实体后描边高亮）
const SCENE_POI_EIDS = {
  workshop: ["57086"], // 生产车间
  sub: ["57090", "57091", "57092"], // 变电所
  grid: ["57084"], // 并网点/杆塔
  pv: ["57088"], // 光伏
  storage: ["57067"], // 储能
};

// 场景目标 code -> ControlAreaCrystal 的区域 Id（State true 高亮 / false 关闭）
// 其余未用到的区域：1 发电南厂房 / 2 发电 / 5 变电北电站 / 8 仓储中心 / 10 原储能
const SCENE_POI_CRYSTAL_ID = {
  grid: 11, // 并网点/电力杆塔
  pv: 9, // 光伏
  workshop: 7, // 生产车间
  air: 6, // 空压
  sub: 4, // 变电
  storage: 3, // 储能
};

// 场景目标字段映射（simulate_result.improvement -> scene poi code）
const IMPROVEMENT_POI_MAP = {
  peakGridDeltaMw: "sub", // 峰段并网峰值 -> 变电所
  dailyMaxDeltaMw: "grid", // 全天购电最大值 -> 并网点
  greenDeltaPct: "pv", // 绿电自用率 -> 光伏板
};

// 仿真结果围栏样式（沿用工具点击的 loop_line 围栏方式）
const SIM_FENCE_STYLE = {
  type: "loop_line",
  fillAreaType: "solid",
  height: 20,
  strokeWeight: 10,
  color: "f853ffff",
  fillAreaColor: "fa3400ff",
  bBlocked: false,
};

export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应数据（迁移至 MockData.js）
      toolData: toolDataMock,
      // Top损失联动的 POI 定位数据（与工具按钮分离）
      lossPoiData: lossPoiDataMock,
      //类型存储
      toolTypes: {
        2: [],
        5: [],
      },

      //对象存储（按钮工具 + Top损失联动各自的对象桶）
      toolObjs: {
        1: [],
        2: [],
        3: [],
        5: [],
        6: [],
        ws1: [],
        air: [],
        pv3: [],
        grid: [],
      },
      activeOutlineObj: null,
      hasSceneInit: false, // 防止场景就绪后重复初始化
      selectedApiPoi: null, // 当前由外部（告警/方案）选中的POI id
      highlightedPlanPois: [], // 当前方案高亮的POI id集合
      scenePoiCoveringIdMap: {}, // { [scenePoiCode]: customId }
      sceneLineCoveringIdMap: {}, // { [sceneLineCode]: customId }
      visibleScenePoiCodes: [], // 当前已显示的 scene POI code 集合（用于差量更新，避免闪动）
      visibleSceneLineCodes: [], // 当前已显示的 scene 线 code 集合（用于差量更新，避免闪动）
      simImprovedPoiCodes: [], // 被仿真结果染色过的场景目标（下次参数/方案联动时需回归常规色）
      simFenceMap: {}, // { [scenePoiCode]: rangeObject } 仿真结果围栏对象
      activeSplitBuildId: null, // 当前已拆楼的建筑 build_id（空压 KYJF / 发电 FDS），关闭时还原
    };
  },
  computed: {
    ...mapState(["isSceneAlready"]),
    /**
     * id 对应方法（用 computed 而非 data，避免方法引用被 keep-alive / HMR 缓存为过期版本）
     */
    toolHandlers() {
      return {
        1: this.mode1_generator,
        2: this.mode2_transformer,
        3: this.mode3_cabinet,
        5: this.mode5_pv3loss,
        6: this.mode6_storage,
      };
    },
  },
  watch: {
    async isSceneAlready(newVal) {
      if (newVal) {
        await this.initAfterSceneReady();
        await this.ensureSceneCoverings();
      }
    },
    async energyScene() {
      await this.ensureSceneCoverings();
    },
  },
  methods: {
    /**
     * 控制场景区域晶体高亮（WDP 自定义接口 ControlAreaCrystal）。
     * @param {string|number} id 区域 Id（见 SCENE_POI_CRYSTAL_ID）
     * @param {boolean} state true 高亮 / false 关闭
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlAreaCrystal(id, state) {
      if (id == null) return;
    },

    /**
     * 控制场景热力图显隐（WDP 自定义接口 ControlHeatMap）。
     * @param {string|number} id 热力图 Id（1=电力，0=碳排）
     * @param {number} alpha 透明度 0~1（0 隐藏，1 显示）
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlHeatMap(id, alpha) {
    },

    /**
     * 左下能源设施按钮的纯相机切换。
     * - 空压/光伏/变电/发电：复用本页已经存在并实际使用的 focusCamera。
     * - 储能：当前没有独立 focusCamera，使用已知 EID 57067 获取实体后调用 CameraControl.Focus。
     * 不创建 POI、Window、围栏，也不调用 closeAll，避免附带业务状态变化。
     */
    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → getByEids → App.CameraControl.Focus
    async focusEnergyCamera(viewKey) {
      const pointCameraMap = {
        air: this.toolData?.[1]?.focusCamera,
        pv: this.toolData?.[5]?.focusCamera,
        transformer: this.toolData?.[2]?.focusCamera,
        generation: this.toolData?.[3]?.focusCamera,
      };

      const pointCamera = pointCameraMap[viewKey];
      if (pointCamera) {
      }

      if (viewKey === "storage") {
        const eids = SCENE_POI_EIDS.storage || [];



      }

      console.warn("[page_2_6] unknown camera toolbar view:", viewKey);
      return false;
    },

    getScenePoiCoveringId(code) {
      return `p2_6_scene_poi_${code}`;
    },

    getSceneLineCoveringId(code) {
      return `p2_6_scene_line_${code}`;
    },

    getOutlineStyleByTargetColor(color) {
      if (color === SCENE_TARGET_COLOR.BENEFIT) return OUTLINE_STYLE.BENEFIT;
      if (color === SCENE_TARGET_COLOR.WARNING) return OUTLINE_STYLE.WARNING;
      return OUTLINE_STYLE.NORMAL;
    },

    // [twin 待实现] 原 wdpapi 调用：setVisualColorStyle → setOutlineThickness
    setupSceneOutlineStyles() {
      try {
        Object.keys(OUTLINE_STYLE).forEach((k) => {
          const cfg = OUTLINE_STYLE[k];
          if (!cfg?.name || !cfg?.color) return;
        });
      } catch (e) {
        console.warn("[page_2_6] setupSceneOutlineStyles failed:", e);
      }
    },

    async setScenePoiEntityHighlight(poiCode, bOn) {
      const crystalId = SCENE_POI_CRYSTAL_ID[poiCode];
      if (crystalId == null) return;
      try {
        await this.controlAreaCrystal(crystalId, bOn);
      } catch (e) {
        console.warn("[page_2_6] setScenePoiEntityHighlight failed:", poiCode, e);
      }
    },

    /**
     * 根据 improvement 字段计算状态色
     * - 峰段并网峰值 / 全天购电最大值：下降(负值)为有利（绿）
     * - 绿电自用率：上升(正值)为有利（绿）
     */
    getImprovementTargetColor(metricKey, rawValue) {
      const val = Number(rawValue);
      if (!Number.isFinite(val)) return null;

      if (metricKey === "greenDeltaPct") {
        return val > 0 ? SCENE_TARGET_COLOR.BENEFIT : SCENE_TARGET_COLOR.WARNING;
      }

      return val < 0 ? SCENE_TARGET_COLOR.BENEFIT : SCENE_TARGET_COLOR.WARNING;
    },

    /**
     * 更新某个场景 POI 围栏颜色（通过 Range.Update）
     */
    // [twin 待实现] 原 wdpapi 调用：getPolygonRangeEntity → updatePolygonRange
    updateScenePoiColor(poiCode, color) {
      if (!poiCode || !color) return;
      const customId = this.scenePoiCoveringIdMap?.[poiCode] || this.getScenePoiCoveringId(poiCode);
      const coordinates = this.energyScene?.pois?.[poiCode];
      if (!customId || !Array.isArray(coordinates) || !coordinates.length) return;

      const payload = {
        customId,
        entityName: `scene-poi-${poiCode}`,
        coordinates,
        color,
        fillAreaColor: color,
      };

      try {
        const styleCfg = this.getOutlineStyleByTargetColor(color);
        this.setScenePoiEntityHighlight(poiCode, true, styleCfg);
      } catch (e) {
        console.warn("[page_2_6] updateScenePoiColor failed:", poiCode, e);
      }
    },

    /**
     * 将 simulate_result.improvement 涉及的场景目标点亮（晶体高亮，只有开/关）
     * 除高亮外，再叠加一层围栏（沿用工具点击的 loop_line 方式）。
     */
    applySimulationImprovementToScene(improvement = {}) {
      if (!improvement || typeof improvement !== "object") return;

      Object.keys(IMPROVEMENT_POI_MAP).forEach((metricKey) => {
        const poiCode = IMPROVEMENT_POI_MAP[metricKey];
        if (!Number.isFinite(Number(improvement[metricKey]))) return;
        this.setScenePoiEntityHighlight(poiCode, true);
        // 围栏颜色按数值正负区分（有利=绿，告警=琥珀），与高亮的状态色一致
        const color = this.getImprovementTargetColor(metricKey, improvement[metricKey]);
        this.addSimFence(poiCode, color);
        if (!this.simImprovedPoiCodes.includes(poiCode)) {
          this.simImprovedPoiCodes.push(poiCode);
        }
      });
    },

    /**
     * 给某个场景目标叠加围栏（沿用 runPoiWindowModule 中 addRange 的方式）。
     * 坐标取自 energyScene.pois[poiCode]；scene 坐标为 2D，补 z 后按 Altitude 放置，
     * 与工具围栏（rangeLocations 带 z=5）保持一致，避免落到海平面(0)不可见。
     */
    // [twin 待实现] 原 wdpapi 调用：addRange
    async addSimFence(poiCode, color) {
      if (!poiCode || this.simFenceMap[poiCode]) return;
      const raw = this.energyScene?.pois?.[poiCode];
      if (!Array.isArray(raw) || !raw.length) return;
      const coordinates = raw
        .filter((c) => Array.isArray(c) && c.length >= 2)
        .map((c) => (c.length >= 3 ? c : [c[0], c[1], 5]));
      if (!coordinates.length) return;
      const fenceColor = color || SIM_FENCE_STYLE.color;
      try {
      } catch (e) {
        console.warn("[page_2_6] addSimFence failed:", poiCode, e);
      }
    },

    /**
     * 删除某个场景目标的围栏。
     */
    // [twin 待实现] 原 wdpapi 调用：deleteObjs
    async removeSimFence(poiCode) {
      const obj = this.simFenceMap[poiCode];
      if (!obj) return;
      try {
      } catch (e) {
        console.warn("[page_2_6] removeSimFence failed:", poiCode, e);
      }
      delete this.simFenceMap[poiCode];
    },

    /**
     * 若某些场景目标曾被仿真结果点亮，且本次方案/参数联动不再涉及，
     * 则关闭其晶体高亮（仍需要的目标保持高亮）。
     */
    resetSimImprovedTargetsToNormal(nextPoiCodes = []) {
      const nextSet = new Set(nextPoiCodes || []);
      if (!Array.isArray(this.simImprovedPoiCodes) || !this.simImprovedPoiCodes.length) {
        return;
      }

      const toReset = this.simImprovedPoiCodes.slice();
      toReset.forEach((poiCode) => {
        const keep = nextSet.has(poiCode);
        this.setScenePoiEntityHighlight(poiCode, keep);
        if (!keep) this.removeSimFence(poiCode);
      });

      this.simImprovedPoiCodes = [];
    },

    // [twin 待实现] 原 wdpapi 调用：getPolygonRangeEntity → updatePolygonRange → setPolygonRangeVisible → addPolygonRange → getParabolaEntity → updateCoveringParabola → setParabolaVisible → addCoveringParabola
    async ensureSceneCoverings() {
      if (!this.isSceneAlready) return;
      const scene = this.energyScene;
      if (!scene || typeof scene !== "object") return;

      const poiMap = (scene && scene.pois) || {};
      const lineMap = (scene && scene.lines) || {};
      const pointMap = (scene && scene.points) || {};

      // 1) 先创建/更新全部区域围栏，默认隐藏
      for (const code of Object.keys(poiMap)) {
        const coordinates = poiMap[code];
        if (!Array.isArray(coordinates) || !coordinates.length) continue;

        const customId = this.getScenePoiCoveringId(code);
        this.scenePoiCoveringIdMap[code] = customId;

        const payload = {
          customId,
          entityName: `scene-poi-${code}`,
          coordinates,
          bVisible: false,
        };

      }

      // 2) 创建/更新全部抛物线，默认隐藏
      for (const code of Object.keys(lineMap)) {
        const rawLine = lineMap[code];
        // lines 存的是 points 点位表的 key 序列，逐个解析为坐标
        const coordinates = (Array.isArray(rawLine) ? rawLine : [])
          .map((key) => (Array.isArray(key) ? key : pointMap[key]))
          .filter((coord) => Array.isArray(coord) && coord.length >= 2);
        if (coordinates.length < 2) continue;

        const customId = this.getSceneLineCoveringId(code);
        this.sceneLineCoveringIdMap[code] = customId;

        const payload = {
          customId,
          entityName: `scene-line-${code}`,
          coordinates,
          bVisible: false,
        };

      }

      // 3) 若当前已有选中方案，则同步显示该方案的覆盖物
      if (this.selectedPlan) {
        this.showPlanSceneCoverings(this.selectedPlan);
      }
    },

    // [twin 待实现] 原 wdpapi 调用：setParabolaVisible → setParabolaVisible
    applySceneCoverings(nextPoiCodes = [], nextLineCodes = []) {
      const prevPoiSet = new Set(this.visibleScenePoiCodes || []);
      const prevLineSet = new Set(this.visibleSceneLineCodes || []);
      const nextPoiSet = new Set(nextPoiCodes || []);
      const nextLineSet = new Set(nextLineCodes || []);

      // 先隐藏「本次不再需要」的
      prevPoiSet.forEach((code) => {
        if (nextPoiSet.has(code)) return;
        this.setScenePoiEntityHighlight(code, false);
      });

      prevLineSet.forEach((code) => {
        if (nextLineSet.has(code)) return;
        const customId = this.sceneLineCoveringIdMap?.[code] || this.getSceneLineCoveringId(code);
        try {
        } catch (e) {
          // ignore
        }
      });

      // 再显示「本次新增需要」的
      nextPoiSet.forEach((code) => {
        if (prevPoiSet.has(code)) return;
        this.setScenePoiEntityHighlight(code, true);
      });

      nextLineSet.forEach((code) => {
        if (prevLineSet.has(code)) return;
        const customId = this.sceneLineCoveringIdMap?.[code] || this.getSceneLineCoveringId(code);
        try {
        } catch (e) {
          // ignore
        }
      });

      this.visibleScenePoiCodes = Array.from(nextPoiSet);
      this.visibleSceneLineCodes = Array.from(nextLineSet);
    },

    hideAllPlanSceneCoverings() {
      this.applySceneCoverings([], []);
    },

    showPlanSceneCoverings(plan) {
      // 1) 方案自带的 code 集合（可为空）
      const basePoiCodes = Array.isArray(plan?.scenePoiCodes) ? plan.scenePoiCodes.slice() : [];
      const baseLineCodes = Array.isArray(plan?.sceneLineCodes) ? plan.sceneLineCodes.slice() : [];

      // 2) 叠加"参数配置"当前表单联动的 code
      const { lineCodes: formLineCodes, poiCodes: formPoiCodes } = this.computeFormSceneCodes(this.verifyForm || {});

      // 3) 合并去重
      const poiCodes = Array.from(new Set([...basePoiCodes, ...formPoiCodes]));
      const lineCodes = Array.from(new Set([...baseLineCodes, ...formLineCodes]));

      // 4) 本次联动涉及到曾被仿真改色的目标时，先恢复为常规色
      this.resetSimImprovedTargetsToNormal(poiCodes);

      this.applySceneCoverings(poiCodes, lineCodes);
    },

    /**
     * 参数配置 → 场景走线/围栏 code 映射（对齐《验策参数走线说明》§3/§4）
     * 线路字典（energyScene.lines）：
     *   E1 grid→sub 外购主通道   E3 pv→sub 光伏辅电   E5 storage→sub 储能削峰
     *   E6 air→workshop 空压供气  E7 pv→workshop 光荷协同  E8 generator→sub 柴发顶峰
     *
     * 规则：
     * - 购电形式(市电/售电/专线)  → E1 恒画（外购主通道）
     * - 场内光伏 在线/离线        → E3 必画（辅电主通道）
     * - 储能峰放 > 0.05MW         → E5（storageMw = 滑条%/100 × 1.2）
     * - 车间移峰 > 0             → 仅罩 workshop 围栏，无走线
     * - 空压 opt/leak            → E6；secure 不画
     * - 并网 limit 限需量         → 需量环在 sub（点亮 sub），无走线
     * - 并网 smooth / 购电 cap    → 仍 grid→sub（E1 已恒画）
     * - 备用柴发 on 强制          → E8；auto/off 不画
     */
    computeFormSceneCodes(form = {}) {
      const linePoiMap = {
        E1: ["grid", "sub"],
        E3: ["pv", "sub"],
        E5: ["storage", "sub"],
        E6: ["air", "workshop"],
        E7: ["pv", "workshop"],
        E8: ["generator", "sub"],
      };

      const lineCodes = new Set();
      const poiCodes = new Set();

      const addLine = (code) => {
        if (!code) return;
        lineCodes.add(code);
        (linePoiMap[code] || []).forEach((p) => poiCodes.add(p));
      };
      const addPoi = (code) => {
        if (code) poiCodes.add(code);
      };

      // 外购主通道：购电形式任一 → grid→sub 恒画
      addLine("E1");

      // 场内光伏（在线/离线）：辅电主通道 pv→sub 必画
      if (form.pvMode === "online" || form.pvMode === "offline") addLine("E3");

      // 储能峰放 > 0.05MW → storage→sub
      const storageMw = ((Number(form.storagePeakOut) || 0) / 100) * 1.2;
      if (storageMw > 0.05) addLine("E5");

      // 车间移峰 > 0 → 仅罩车间围栏，无方向走线
      if (Number(form.workshopShift) > 0) addPoi("workshop");

      // 空压 opt/leak → air→workshop；secure 不画
      if (form.airStrategy === "opt" || form.airStrategy === "leak") addLine("E6");

      // 并网 limit 限需量 → 需量环在 sub（仅点亮，无走线）
      if (form.gridMode === "limit") addPoi("sub");

      // 备用柴发 on 强制顶峰 → generator→sub
      if (form.dieselMode === "on") addLine("E8");

      return {
        lineCodes: Array.from(lineCodes),
        poiCodes: Array.from(poiCodes),
      };
    },

    /**
     * 表单/方案变化后重新刷新场景高亮
     */
    refreshFormSceneCoverings() {
      if (!this.isSceneAlready) return;
      this.showPlanSceneCoverings(this.selectedPlan || null);
    },

    // [twin 待实现] 原 wdpapi 调用：ClearByEids → deleteObjs → splitBuildByName → deleteTypes → resetCamera → setEntityOutline
    async closeAll(resetCam = true) {
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          // 收集所有 Window 对象的 EID，用 ClearByEids 删除（比 deleteObjs 对 iframe Window 更可靠）
          const windowEids = this.toolObjs[key]
            .map(obj => obj?.Eid || obj?.eid)
            .filter(Boolean);
          if (windowEids.length) {
          }
          // 非 Window 类型的对象仍用 deleteObjs 兜底
          const nonWindowObjs = this.toolObjs[key].filter(obj => !(obj?.Eid || obj?.eid));
          if (nonWindowObjs.length) {
          }
          this.toolObjs[key] = [];
        }
      }
      // 拆楼特效还原（空压/发电按钮）
      if (this.activeSplitBuildId) {
        this.activeSplitBuildId = null;
      }
      // 额外保险：清掉场景中残留的所有 Window 类型
      // 同步清掉 POI 引用缓存，避免持有过期对象
      this._activePoiMap = {};
      if (resetCam) {
      }
      if (this.activeOutlineObj) {
        this.activeOutlineObj = null;
      }
      this.selectedApiPoi = null;
      this.$store.commit("setWindowEid", null);
      this.$store.commit('setGen2Active', false);
    },

    // [twin 待实现] 原 wdpapi 调用：ClearByEids → deleteObjs → FocusByPoints → addPOI → ClearByEids → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS → <实体>.onClick
    async runPoiWindowModule(data, index, fallbackPrefix, onWindowChange) {
      if (!data?.poiLocation?.length) return;

      // 防护：该工具下若已有对象，先清干净，避免重复 onClick 注册导致同位置多个 Window 互相覆盖
      if (this.toolObjs[index] && this.toolObjs[index].length > 0) {
        const eids = this.toolObjs[index].map(o => o?.Eid || o?.eid).filter(Boolean);
        this.toolObjs[index] = [];
      }




      // 把当前工具的 POI 集合缓存到 mixin 实例上（非响应式），供 selectPoiByApiId 外部触发使用
      if (!this._activePoiMap) this._activePoiMap = {};

      let activeWindowIndex = -1;
      let activeWindowObj = null;
      let activeRangeObjs = [];
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon = sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    // 空压（toolId 1）：先聚焦+出 POI 图标，点击图标再拆楼 KYJF
    async mode1_generator(data, index) {
      await this.runSplitBuildModule(data, index, "空压", "KYJF");
    },

    async mode2_transformer(data, index) {
      await this.runPoiWindowModule(data, index, "变压器");
    },

    // 发电（toolId 3）：先聚焦+出 POI 图标，点击图标再拆楼 FDS
    async mode3_cabinet(data, index) {
      await this.runSplitBuildModule(data, index, "发电", "FDS");
    },

    /**
     * 拆楼工具：第一次点击左下按钮 = 聚焦相机 + 生成 POI 图标（不拆楼）；
     * 第二次点击场景中的 POI 图标 = 展开拆楼（floor "1"）并移除该 POI 图标。
     * 合拢还原由 closeAll 兜底（再次点按钮/切换工具时触发）。
     */
    // [twin 待实现] 原 wdpapi 调用：ClearByEids → deleteObjs → FocusByPoints → addPOI → FocusByPoints → splitBuildByName → deleteObjs → <实体>.onClick
    async runSplitBuildModule(data, index, fallbackPrefix, buildId) {
      if (!data?.poiLocation?.length) return;

      // 该工具下若已有对象，先清干净，避免重复 onClick 注册
      if (this.toolObjs[index] && this.toolObjs[index].length > 0) {
        const eids = this.toolObjs[index].map((o) => o?.Eid || o?.eid).filter(Boolean);
        this.toolObjs[index] = [];
      }



      if (!this._activePoiMap) this._activePoiMap = {};

    },

    async mode5_pv3loss(data, index) {
      await this.runPoiWindowModule(data, index, "地面西站");
    },

    async mode6_storage(data, index) {
      await this.runPoiWindowModule(data, index, "储能");
    },

    /**
     * 根据接口下发的 POI 标识 / 完整 loss 对象联动场景：
     *  1) 同步左侧工具栏激活状态
     *  2) closeAll → 跑对应工具模块（创建 POI/相机预聚焦）
     *  3) 主动触发对应 POI 的点击 handler，并把 lossWindow 作为弹窗内容 override 传入
     *
     * @param {string|object} payload
     *   - 传字符串：被视为 apiPoiId（即 topLosses[].poi），弹窗使用默认 POI 数据
     *   - 传对象（推荐）：完整 loss 对象，含 poi 字段；若带 lossWindow 则用其覆盖弹窗内容
     */
    // [twin 待实现] 原 wdpapi 调用：<实体>.Update → <实体>.Update
    async selectPoiByApiId(payload) {
      if (!payload) return;
      const apiPoiId = typeof payload === 'string' ? payload : payload.poi;
      const windowOverride = (typeof payload === 'object' && payload.lossWindow) ? payload.lossWindow : null;

      if (!apiPoiId) return;
      const data = this.lossPoiData?.[apiPoiId];
      if (!data) {
        console.warn('[page_2_6] selectPoiByApiId 无定位数据：', apiPoiId);
        return;
      }
      const poiIndex = 0;

      // 0) 再次点击同一条目 → 与左侧工具再次点击一致：整体清除并复位相机（closeAll 内已置空 selectedApiPoi）
      if (this.selectedApiPoi === apiPoiId) {
        if (typeof this.closeAll === 'function') {
          await this.closeAll();
        }
        return;
      }

      // 1) Top损失联动定位时，工具栏不激活任何条目（保持全部非选中）
      if (Array.isArray(this.cameraTools)) {
        this.cameraTools.forEach((t) => {
          t.isActive = false;
        });
      }

      // 2) 关闭其它对象的 POI/弹窗 → 跑损失定位模块（closeAll 会重置 selectedApiPoi，故随后再置位）
      if (typeof this.closeAll === 'function') {
        await this.closeAll();
      }

      this.selectedApiPoi = apiPoiId;

      // 用 poi 标识作为对象桶索引，直接跑通用 POI/弹窗模块（不经过工具按钮的 toolHandlers）
      const prefix = data.poiConfig?.entityName?.[0] || apiPoiId;
      await this.runPoiWindowModule(data, apiPoiId, prefix);

      // 3) 立即将 POI 图标替换为风险点位图标（避免创建后显示蓝色默认图标的闪烁）
      //    同时隐藏 labelBg（WDP 默认会渲染蓝色标签背景框）
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const riskIcon = sourceUrl + 'DT_risk_point.png';
      const poiObjs = this._activePoiMap?.[apiPoiId];

      // 4) 主动触发对应 POI 的 click handler，复用既有的"聚焦+outline+弹窗"逻辑，
      //    并把 lossWindow 作为 windowOverride 传入，覆盖默认弹窗内容
      const handlers = this._poiClickHandlers?.[apiPoiId];
      const target = handlers && handlers[poiIndex];
      if (typeof target === 'function') {
        // 始终注入 _riskIcon，确保 clickHandler 内部的图标 Update 直接用红色图标，
        // 而非依赖 clickHandler 执行后的第二次 Update（可能被 WDP 相机到位事件覆盖）
        const riskOverride = { ...(windowOverride || {}), _riskIcon: riskIcon };
        await target(riskOverride);
      } else {
        console.warn('[page_2_6] selectPoiByApiId 找不到 POI click handler', { apiPoiId, poiIndex });
      }

      // 5) clickHandler 内部会把图标设为 activeIcon（蓝色），需要再次覆盖回风险图标
    },

    highlightPlanPois(payload) {
      // 供右栏方案选中时调用：
      // 1) 记录传统 poi ids（兼容旧逻辑）
      // 2) 根据 scenePoiCodes/sceneLineCodes 控制覆盖物显隐
      if (Array.isArray(payload)) {
        this.highlightedPlanPois = payload.slice();
        return;
      }

      const plan = payload && typeof payload === "object" ? payload : null;
      this.highlightedPlanPois = Array.isArray(plan?.pois) ? plan.pois.slice() : [];
      this.showPlanSceneCoverings(plan);
    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      this.setupSceneOutlineStyles();
      await this.normalPoi('/page_2/6-workshop');
    },

  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：setEntityOutline → deleteTypes → clearPolygonRangeCache → clearParabolaCache
  async beforeDestroy() {
    if (this.activeOutlineObj) {
      this.activeOutlineObj = null;
    }
    const allScenePoiCodes = Object.keys(SCENE_POI_EIDS || {});
    allScenePoiCodes.forEach((code) => {
      this.setScenePoiEntityHighlight(code, false, OUTLINE_STYLE.NORMAL);
    });
    this.$store.commit('setGen2Active', false);
    // 清理场景中所有覆盖物类型，包括方案联动的 Range / Parabola
    // 清空覆盖物前端缓存
    this.scenePoiCoveringIdMap = {};
    this.sceneLineCoveringIdMap = {};
    this.simImprovedPoiCodes = [];
  },
};
