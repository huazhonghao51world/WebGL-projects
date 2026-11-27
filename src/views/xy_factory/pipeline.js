import { publishedSequences } from "./motion";

// 注射器智造线：XY 工厂一次性无菌注射器从立库取料到成品入立体库的连续生产过程。
// 各工序的设备运动来自场景组交付的 UE Sequencer 片段，按工艺顺序首尾衔接、批次循环；
// 场景就绪即直接播放、批次循环；“跟随产线视角”只切换镜头（按 UE 机位观察当前工序），倍速调节播放速度。
// SDK 全局只有一条动画通道，因此园区总览、基地鸟瞰这类纯镜头内容改由 flyover.js 的相机巡航回放，不占用该通道。

/** 立体库巷道视角（取自 SQ_3 镜头 1 第 25 秒机位）。 */
export const STACKER_VIEW = { id: "xy-stacker-aisle", name: "立体库巷道", position: [45.45, 21.22, -55.84], target: [200.5, 14.25, -55.43] };

// view：不跟随产线视角时“查看工序”的机位（均已核对：所在楼栋先拆楼，机位在设备斜上方且无高大构件遮挡）。
// 工序顺序与 UE Sequencer 编号一致（SQ_3 → SQ_8）：立体库堆垛机取出原料托盘 → AGV 接驳下楼 → 运输 → 注塑 → 组装 → 包装入库。
export const stages = [
  { id: "retrieve", name: "立库取料", area: "库区楼 · 立体库原料区", building: "warehouse", desc: "按生产工单下发出库指令，堆垛机伸叉从原料区库位取出 PP / PE 粒料托盘，沿巷道送到出库口。",
    // 沿巷道（UE 相机所在的 z ≈ -55.8 中线）正对堆垛机；STACKER_VIEW 背对堆垛机、看向巷道远端，不适合观察存取。
    view: { position: [45, 21.2, -55.8], target: [27, 20.5, -55.8] },
    segments: [{ clip: "SQ_3_likuquanjing", label: "堆垛机出库取料" }] },
  { id: "issue", name: "AGV 接驳", area: "出库口 → 货梯", building: "warehouse", desc: "AGV 叉车在出库口接驳原料托盘，经货梯从库区楼 2F 下到 1F。",
    view: { position: [108, 34, -36], target: [93, 20, -50] },
    segments: [{ clip: "SQ_4_yuanliaochuku", label: "AGV 叉取托盘下楼" }] },
  { id: "transport", name: "原料配送", area: "厂内通道 → 注塑车间", building: "production", desc: "AGV 穿过卷帘门，把 25 kg 粒料袋送到注塑车间中央供料区。",
    view: { position: [104, 30, 34], target: [88, 14.5, 12] },
    segments: [{ clip: "SQ_5_yuanliaoyunshu", label: "AGV 配送至注塑车间" }] },
  { id: "molding", name: "注塑成型", area: "生产楼 · 注塑车间", building: "production", desc: "粒料经除湿干燥、中央供料进入注塑机，A 机成型针筒、B 机成型针帽。",
    view: { position: [44, 27, 26], target: [37, 15, 12] },
    segments: [{ clip: "SQ_6_zhusuchengxing", label: "注塑机 A/B 开合模" }] },
  { id: "assembly", name: "洁净组装", area: "生产楼 · 组装洁净区", building: "production", desc: "针筒、针帽经振动盘排序上料，在组装线 A 完成装配、视觉检测并下线。",
    view: { position: [82, 30, 20], target: [70, 15, 3] },
    segments: [
      { clip: "SQ_7_CPZZ_A1", label: "进入组装洁净区" },
      { clip: "SQ_7_CPZZ_A2", label: "组装线 A 全景" },
      { clip: "SQ_7_CPZZ_B", label: "上料工位" },
      { clip: "SQ_7_CPZZ_C", label: "输送与定位" },
      { clip: "SQ_7_CPZZ_D", label: "提升输送" },
      { clip: "SQ_7_CPZZ_E", label: "振动盘排序" },
      { clip: "SQ_7_CPZZ_F", label: "装配工位" },
      { clip: "SQ_7_CPZZ_G", label: "检测下线" },
    ] },
  { id: "packing", name: "包装入库", area: "打包区 → 立体库成品区", building: "warehouse", desc: "成品装箱，码垛机械臂按 48 箱/托码垛，经提升机送入立体库，堆垛机上架入成品区。",
    view: { position: [100, 34, -26], target: [86, 19, -42] },
    segments: [
      { clip: "SQ_8_dabaoruku1", label: "装箱码垛与提升" },
      { clip: "SQ_8_dabaoruku2", label: "堆垛机成品上架" },
    ] },
];

/** 产线播放倍速。 */
export const WORLD_SPEEDS = [1, 2, 4, 8];

export const idleLine = {
  available: false, reason: "三维场景连接后可用", running: false, batch: 0, stage: -1, segment: -1, speed: 1, follow: false,
  stageMs: 0, stageDurationMs: 0, batchMs: 0, batchDurationMs: 0, durations: [], worldMs: 0,
};

// UE 导出会在片段名后追加序号（SQ_3_likuquanjing_0 → _1），且每次导出都可能变化：按去掉序号后的名称匹配。
const baseClip = (name) => String(name).replace(/_\d+$/, "");

/** 在场景实体中查找动画片段：优先已发布序列（带时长与切镜），否则扫描模型实体自带片段。clip 为去序号的基名。 */
function locateClip(viewer, published, clip) {
  const nameIn = (entityId) => { try { return viewer.scene.getClipNames(entityId).find((n) => n === clip || baseClip(n) === clip); } catch (error) { return undefined; } };
  for (const found of published) {
    if (baseClip(found.clip) !== clip && found.clip !== clip) continue;
    const name = nameIn(found.entityId);
    if (name === found.clip) return { entityId: found.entityId, clip: name, durationMs: found.durationMs || 0, shots: found.shots || [] };
  }
  let entities = [];
  try { entities = viewer.scene.getDocument().entities; } catch (error) { entities = []; }
  for (const item of entities) { const name = nameIn(item.entityId); if (name) return { entityId: item.entityId, clip: name, durationMs: 0, shots: [] }; }
  return null;
}

/**
 * 绑定已发布场景的动画（不自动播放，由 play / pause 开始、停止生产）。onChange 收到可直接渲染的快照。
 * 返回的控制器只有 setSpeed / setFollow / snapshot / dispose：生产线不能被界面停止或跳转。
 */
export function createProductionLine(viewer, onChange) {
  const published = publishedSequences(viewer);
  const plan = stages.map((stage) => ({
    ...stage,
    segments: stage.segments.map((seg) => {
      const found = locateClip(viewer, published, seg.clip);
      return { ...seg, ok: Boolean(found), clip: found ? found.clip : seg.clip, entityId: found && found.entityId, durationMs: (found && found.durationMs) || 0, shots: (found && found.shots) || [] };
    }),
  }));
  const missing = plan.flatMap((s) => s.segments.filter((g) => !g.ok).map((g) => g.clip));
  const durations = plan.map((s) => s.segments.reduce((t, g) => t + g.durationMs, 0));
  const batchDurationMs = durations.reduce((t, d) => t + d, 0);
  let si = -1;
  let gi = -1;
  let batch = 0;
  let speed = 1;
  let follow = false;
  let worldMs = 0;
  let lastTick = 0;
  let switching = false;
  let disposed = false;
  let timer = 0;

  const current = () => (si >= 0 && gi >= 0 ? plan[si].segments[gi] : null);
  const isMine = (state) => { const seg = current(); return seg && state.kind === "clip" && state.entityId === seg.entityId && state.name === seg.clip; };
  const clearCuts = () => { try { if (viewer.camera.getCameraCuts()) viewer.camera.clearCameraCuts(); } catch (error) { /* 已无运镜 */ } };

  function snapshot() {
    const state = viewer.animations.getState();
    const time = isMine(state) ? state.timeMs : 0;
    const segBefore = si < 0 ? 0 : plan[si].segments.slice(0, gi).reduce((t, g) => t + g.durationMs, 0);
    const stageBefore = si < 0 ? 0 : durations.slice(0, si).reduce((t, d) => t + d, 0);
    return {
      available: !missing.length, reason: missing.length ? `场景缺少工序运动数据：${missing.join("、")}` : "",
      running: si >= 0 && !paused, started: si >= 0, batch, stage: si, segment: gi, speed, follow,
      stageMs: segBefore + time, stageDurationMs: si >= 0 ? durations[si] : 0,
      batchMs: stageBefore + segBefore + time, batchDurationMs, durations, worldMs,
    };
  }
  const emit = () => { if (!disposed) onChange(snapshot()); };
  // 世界时钟按倍率累计真实流逝时间；每 250 ms 推送一次快照。
  function tick() {
    const now = performance.now();
    if (paused) { lastTick = 0; emit(); return; }
    if (lastTick) worldMs += (now - lastTick) * speed;
    lastTick = now;
    emit();
  }

  function applyView(seg) {
    if (!follow) { clearCuts(); return Promise.resolve(); }
    if (seg.shots.length && !seg.view) {
      const cuts = { entityId: seg.entityId, shots: seg.shots.map(({ camera, fromMs }) => ({ camera, fromMs })) };
      try { viewer.camera.setCameraCuts(cuts); } catch (error) { clearCuts(); viewer.camera.setCameraCuts(cuts); }
      return Promise.resolve();
    }
    clearCuts();
    const view = seg.view || plan[si].view;
    return view ? viewer.camera.flyTo({ id: `xy-line-${plan[si].id}`, name: plan[si].name, ...view }, 800).catch(() => {}) : Promise.resolve();
  }

  function begin(nextStage, nextSegment) {
    si = nextStage; gi = nextSegment;
    const seg = current();
    switching = true;
    try {
      viewer.animations.playClip(seg.entityId, seg.clip, { loop: false });
      viewer.animations.setRate(speed);
      if (follow) applyView(seg);
    } finally { switching = false; }
    emit();
  }
  function advance() {
    if (gi + 1 < plan[si].segments.length) return begin(si, gi + 1);
    if (si + 1 < plan.length) return begin(si + 1, 0);
    batch += 1;
    return begin(0, 0);
  }

  const offs = [
    viewer.events.on("animation.finished", (state) => { if (isMine(state)) advance(); }),
    // 产线不能被中断：若被其他调用打断，立即从当前工序段续上。
    viewer.events.on("animation.cancelled", (state) => {
      if (switching || disposed || paused || !isMine(state)) return;
      setTimeout(() => { if (!disposed && si >= 0) begin(si, gi); }, 0);
    }),
  ];

  // 产线默认停产：场景就绪后不自动播放，由“开始生产”启动；“停止生产”停在当前位置，再次开始时从当前工序续播。
  let paused = true;
  const ready = !missing.length && viewer.getState() === "ready";
  if (ready) timer = setInterval(tick, 250);
  function play() {
    if (!ready || disposed || viewer.getState() !== "ready") return;
    lastTick = performance.now();
    paused = false;
    if (si < 0) { batch = Math.max(1, batch); begin(0, 0); return; }
    if (isMine(viewer.animations.getState())) viewer.animations.resume(); else begin(si, gi);
  }
  function hold() {
    if (paused) return;
    tick();
    paused = true;
    lastTick = 0;
    try { if (isMine(viewer.animations.getState())) viewer.animations.pause(); } catch (error) { /* 场景已卸载 */ }
  }

  return {
    snapshot,
    /** 开始生产：首次从立库取料开始；停产后再次开始则从当前工序续播。 */
    play() { play(); emit(); return snapshot(); },
    /** 停止生产：设备停在当前位置；跟随视角一并退出由页面处理。 */
    pause() { hold(); emit(); return snapshot(); },
    /** 加快世界时间：设备运动与产线节拍同步加快。 */
    setSpeed(next) {
      if (disposed || !WORLD_SPEEDS.includes(Number(next))) return snapshot();
      tick();
      speed = Number(next);
      if (isMine(viewer.animations.getState())) viewer.animations.setRate(speed);
      emit();
      return snapshot();
    },
    /** 跟随产线视角：按 UE 机位观察当前工序；关闭后相机交还用户，产线照常运行。 */
    setFollow(on) {
      if (disposed) return snapshot();
      follow = Boolean(on);
      // 跟随观察需要设备在动：停产时打开跟随即开始生产。
      if (follow && paused) play();
      const seg = current();
      if (seg) applyView(seg); else if (!follow) clearCuts();
      emit();
      return snapshot();
    },
    /** 跳播：从指定工序开始流转，进度随之更新。 */
    jump(stage) {
      const n = Number(stage);
      if (disposed || !ready || !(n >= 0 && n < plan.length)) return snapshot();
      paused = false;
      lastTick = performance.now();
      begin(n, 0);
      return snapshot();
    },
    /** 新批次投产：当前批次收尾计数，从第一道工序（立库取料）重新完整流转，便于观看全流程。 */
    restart() {
      if (disposed || !ready) return snapshot();
      batch += 1;
      paused = false;
      lastTick = performance.now();
      begin(0, 0);
      return snapshot();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      clearInterval(timer);
      offs.forEach((off) => off());
      try {
        if (isMine(viewer.animations.getState())) viewer.animations.stop();
        clearCuts();
      } catch (error) { /* 场景已卸载 */ }
    },
  };
}

/** 片段所在的模型实体（clip 为候选名列表时取第一个存在的）；找不到返回 null。 */
export function findClip(viewer, clips) {
  const published = publishedSequences(viewer);
  for (const clip of [].concat(clips)) {
    const found = locateClip(viewer, published, clip);
    if (found) return { clip: found.clip, entityId: found.entityId };
  }
  return null;
}
