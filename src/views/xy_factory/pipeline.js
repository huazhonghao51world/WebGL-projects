import { publishedSequences } from "./motion";

// 产品生产流水线：由场景组预置的 UE 镜头动画按生产顺序串起来。
// 动画是固定演示，不是实时生产 runtime；前端只负责编排播放顺序与运镜。
// SQ_8 第二段没有镜头，使用立体库巷道视角（取自 SQ_3 镜头 1 第 25 秒机位）。
export const STACKER_VIEW = { id: "xy-stacker-aisle", name: "立体库巷道", position: [45.45, 21.22, -55.84], target: [200.5, 14.25, -55.43] };

export const stages = [
  { id: "overview", name: "园区总览", area: "XY 园区", building: null, desc: "入口大门、办公楼、研发楼、生产楼与库区楼全貌。",
    segments: [{ clip: "SQ_1_zonglan_4", label: "园区入口与主楼" }] },
  { id: "base", name: "基地鸟瞰", area: "生产楼 · 库区楼", building: null, desc: "沿生产楼、库区楼屋顶光伏俯瞰生产基地。",
    segments: [{ clip: "SQ_2_jidi_3", label: "生产基地鸟瞰" }] },
  { id: "storage", name: "立体库", area: "库区楼", building: "warehouse", desc: "堆垛机四级伸缩货叉、提升机与转运机协同存取托盘。",
    segments: [{ clip: "SQ_3_likuquanjing_0", label: "立体库全景" }] },
  { id: "issue", name: "原料出库", area: "库区楼 → 电梯厅", building: "warehouse", desc: "AGV 叉车从原料区叉取 PP/PE 粒料托盘，经货梯下楼。",
    segments: [{ clip: "SQ_4_yuanliaochuku_2", label: "AGV 叉取原料" }] },
  { id: "transport", name: "原料运输", area: "厂内通道 → 注塑车间", building: "production", desc: "AGV 穿过卷帘门，把 25 kg 粒料袋送到注塑车间供料区。",
    segments: [{ clip: "SQ_5_yuanliaoyunshu_1", label: "AGV 运输至注塑车间" }] },
  { id: "molding", name: "注塑成型", area: "生产楼 · 注塑车间", building: "production", desc: "粒料经干燥、中央供料进入注塑机，A 机成型针筒、B 机成型针帽。",
    segments: [{ clip: "SQ_6_zhusuchengxing_0", label: "注塑机 A/B 开合模" }] },
  { id: "assembly", name: "产品组装", area: "生产楼 · 组装洁净区", building: "production", desc: "针筒、针帽经振动盘排序上料，在组装线 A 完成装配、检测并下线。",
    segments: [
      { clip: "SQ_7_CPZZ_A1_7", label: "进入组装洁净区" },
      { clip: "SQ_7_CPZZ_A2_8", label: "组装线 A 全景" },
      { clip: "SQ_7_CPZZ_B_9", label: "上料工位" },
      { clip: "SQ_7_CPZZ_C_10", label: "输送与定位" },
      { clip: "SQ_7_CPZZ_D_11", label: "提升输送" },
      { clip: "SQ_7_CPZZ_E_12", label: "振动盘排序" },
      { clip: "SQ_7_CPZZ_F_13", label: "装配工位" },
      { clip: "SQ_7_CPZZ_G_14", label: "检测下线" },
    ] },
  { id: "packing", name: "打包入库", area: "打包区 → 立体库", building: "warehouse", desc: "成品装箱，中转机械臂码垛，经提升机送入立体库，堆垛机上架。",
    segments: [
      { clip: "SQ_8_dabaoruku1_1", label: "装箱码垛与提升" },
      { clip: "SQ_8_dabaoruku2_6", label: "堆垛机入库上架", view: STACKER_VIEW },
    ] },
];

export const idleFlow = { available: false, reason: "三维场景连接后可播放", active: false, playing: false, mode: "", stage: -1, segment: -1, timeMs: 0, durationMs: 0, elapsedMs: 0, totalMs: 0, durations: [] };

/** 绑定已发布场景的动画，返回流水线播放器。onChange 收到可直接渲染的快照。 */
export function createPipeline(viewer, onChange) {
  const published = new Map(publishedSequences(viewer).map((item) => [item.clip, item]));
  const plan = stages.map((stage) => ({
    ...stage,
    segments: stage.segments.map((seg) => {
      const found = published.get(seg.clip);
      let ok = false;
      try { ok = Boolean(found) && viewer.scene.getClipNames(found.entityId).includes(seg.clip); } catch (error) { ok = false; }
      return { ...seg, ok, entityId: found && found.entityId, durationMs: (found && found.durationMs) || 0, shots: (found && found.shots) || [] };
    }),
  }));
  const missing = plan.flatMap((s) => s.segments.filter((g) => !g.ok).map((g) => g.clip));
  const durations = plan.map((s) => s.segments.reduce((t, g) => t + g.durationMs, 0));
  const totalMs = durations.reduce((t, d) => t + d, 0);
  let mode = "";
  let si = -1;
  let gi = -1;
  let switching = false;
  let disposed = false;
  let timer = 0;

  const current = () => (si >= 0 && gi >= 0 ? plan[si].segments[gi] : null);
  const isMine = (state) => { const seg = current(); return seg && state.kind === "clip" && state.entityId === seg.entityId && state.name === seg.clip; };
  function snapshot() {
    const state = viewer.animations.getState();
    const mine = isMine(state);
    const before = si < 0 ? 0 : durations.slice(0, si).reduce((t, d) => t + d, 0) + plan[si].segments.slice(0, gi).reduce((t, g) => t + g.durationMs, 0);
    return {
      available: !missing.length, reason: missing.length ? `场景缺少动画片段：${missing.join("、")}` : "",
      active: si >= 0, playing: mine && state.playing, mode, stage: si, segment: gi,
      timeMs: mine ? state.timeMs : 0, durationMs: current() ? current().durationMs : 0,
      elapsedMs: before + (mine ? state.timeMs : 0), totalMs, durations,
    };
  }
  const emit = () => { if (!disposed) onChange(snapshot()); };
  const tick = (on) => { clearInterval(timer); timer = on ? setInterval(emit, 200) : 0; };
  const clearCuts = () => { try { if (viewer.camera.getCameraCuts()) viewer.camera.clearCameraCuts(); } catch (error) { /* 已无运镜 */ } };

  async function start(nextStage, nextSegment) {
    si = nextStage; gi = nextSegment;
    const seg = current();
    switching = true;
    try {
      if (seg.view || !seg.shots.length) {
        clearCuts();
        if (seg.view) await viewer.camera.flyTo(seg.view, 800);
        if (disposed || current() !== seg) return;
      }
      viewer.animations.playClip(seg.entityId, seg.clip, { loop: false });
      if (seg.shots.length && !seg.view) {
        const cuts = { entityId: seg.entityId, shots: seg.shots.map(({ camera, fromMs }) => ({ camera, fromMs })) };
        try { viewer.camera.setCameraCuts(cuts); } catch (error) { clearCuts(); viewer.camera.setCameraCuts(cuts); }
      }
    } finally { switching = false; }
    tick(true);
    emit();
  }
  function finish() {
    tick(false);
    if (isMine(viewer.animations.getState())) viewer.animations.stop();
    clearCuts();
    si = -1; gi = -1; mode = "";
    emit();
  }
  function advance() {
    if (gi + 1 < plan[si].segments.length) return start(si, gi + 1);
    if (mode === "all" && si + 1 < plan.length) return start(si + 1, 0);
    return finish();
  }

  const offs = [
    viewer.events.on("animation.finished", (state) => { if (isMine(state)) advance(); }),
    viewer.events.on("animation.cancelled", (state) => { if (!switching && isMine(state)) { tick(false); si = -1; gi = -1; mode = ""; clearCuts(); emit(); } }),
  ];
  const guard = (fn) => (...args) => { if (disposed || missing.length) return undefined; return fn(...args); };

  return {
    snapshot,
    playAll: guard(() => { mode = "all"; return start(0, 0); }),
    playStage: guard((index) => { mode = "stage"; return start(index, 0); }),
    jump: guard((index) => { if (si < 0) return undefined; return start(Math.max(0, Math.min(plan.length - 1, index)), 0); }),
    toggle: guard(() => {
      if (si < 0) { mode = "all"; return start(0, 0); }
      const state = viewer.animations.getState();
      if (!isMine(state)) return undefined;
      if (state.playing) { viewer.animations.pause(); tick(false); } else { viewer.animations.resume(); tick(true); }
      emit();
      return undefined;
    }),
    stop: () => { if (!disposed && si >= 0) finish(); },
    dispose() {
      if (disposed) return;
      if (si >= 0) finish();
      disposed = true;
      tick(false);
      offs.forEach((off) => off());
    },
  };
}
