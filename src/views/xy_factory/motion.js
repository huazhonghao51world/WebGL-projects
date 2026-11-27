import { getTwinApp } from "@/utils/twin/app";

// 场景组交付的 UE Sequencer 序列。运动全部来自 GLB 自带片段，前端只做播放控制。
// 序列清单与切镜表由发布流程（scripts/release-xy-scene.cjs）写入各模型实体的 customData.sequences：
// 切镜点按镜头开始运动的时刻自动推断，SQ_3 使用 UE Camera Cuts 的人工切镜表。
const CLIP_LABELS = {
  SQ_3_likuquanjing: "库区全景",
};
// 旧发布版没有 customData.sequences 时的兜底（SQ_3，第 900 帧切镜）。
const LEGACY = [{ entityId: "xy-prop-sq3", clip: "SQ_3_likuquanjing_0", durationMs: 0, shots: [{ camera: "CineCameraActor_SQ3_1", fromMs: 0 }, { camera: "CineCameraActor_SQ3_2", fromMs: 30100 }] }];

const labelOf = (clip) => {
  const code = /^(SQ_?\d+)/i.exec(clip);
  const name = CLIP_LABELS[clip.replace(/_\d+$/, "")];
  return name ? `${code ? code[1].replace("_", "") : clip} ${name}` : clip.replace(/_\d+$/, "");
};

/** 已发布场景中可播放的全部序列（按 SQ 序号排序）。 */
export function publishedSequences(viewer) {
  let list = [];
  try {
    for (const entity of viewer.scene.getDocument().entities) {
      const sequences = entity.customData && entity.customData.sequences;
      if (Array.isArray(sequences)) for (const item of sequences) list.push({ entityId: entity.entityId, ...item });
    }
  } catch (error) { list = []; }
  if (!list.length) list = LEGACY;
  const order = (clip) => { const m = /SQ_?(\d+)/i.exec(clip); return m ? Number(m[1]) : 999; };
  return list
    .map((item) => ({ ...item, label: labelOf(item.clip), shots: item.shots.map((shot, index) => ({ ...shot, label: `镜头 ${index + 1}` })) }))
    .sort((a, b) => order(a.clip) - order(b.clip) || a.clip.localeCompare(b.clip));
}

export const idleMotion = {
  available: false, reason: "三维场景连接后可用", cameras: false, label: "", shots: [], sequences: [], index: 0,
  follow: false, loop: false, active: false, playing: false, timeMs: 0, durationMs: 0, rate: 1, shot: null,
};
/** 播放场景 GLB 自带的动画片段，并可按切镜表跟随模型内置相机。onChange 收到可直接渲染的纯数据快照。 */
export function connectMotion(onChange) {
  const app = getTwinApp();
  const viewer = app.viewer;
  const sequences = publishedSequences(viewer);
  let index = 0;
  let seq = sequences[0];
  let shots = [];
  let available = false;
  let reason = "";
  let cameras = false;
  function select(next) {
    index = Math.max(0, Math.min(sequences.length - 1, next));
    seq = sequences[index];
    shots = seq.shots;
    available = false;
    reason = "";
    try {
      available = viewer.scene.getClipNames(seq.entityId).includes(seq.clip);
      if (!available) reason = `场景模型缺少动画片段 ${seq.clip}`;
    } catch (error) {
      reason = "当前发布版没有带动画的模型";
    }
    cameras = false;
    if (available && shots.length) {
      try {
        const paths = viewer.camera.getNodeCameras(seq.entityId).map((item) => item.path);
        cameras = shots.every((shot) => paths.filter((path) => path.includes(shot.camera)).length === 1);
      } catch (error) { cameras = false; }
    }
  }
  select(0);
  let follow = cameras;
  let loop = false;
  let owned = false;
  let starting = false;
  let disposed = false;
  let timer = 0;
  const live = () => !disposed && getTwinApp() === app && viewer.getState() === "ready";
  const isMine = (state) => state.kind === "clip" && state.entityId === seq.entityId && state.name === seq.clip;

  function snapshot() {
    const state = viewer.animations.getState();
    const mine = owned && isMine(state);
    const cuts = viewer.camera.getCameraCuts();
    return {
      available, reason, cameras, label: seq.label, shots, follow, loop, active: mine,
      sequences: sequences.map((item) => ({ clip: item.clip, label: item.label })), index,
      playing: mine && state.playing, timeMs: mine ? state.timeMs : 0, durationMs: mine ? state.durationMs : 0,
      rate: mine ? state.rate : 1, shot: cuts && cuts.entityId === seq.entityId ? cuts.activeShot : null,
    };
  }
  const emit = () => { if (live()) onChange(snapshot()); };
  function tick(on) {
    clearInterval(timer);
    timer = on ? setInterval(emit, 100) : 0;
  }
  function startCuts() {
    if (!follow || !cameras || viewer.camera.getCameraCuts()) return;
    viewer.camera.setCameraCuts({ entityId: seq.entityId, shots: shots.map(({ camera, fromMs }) => ({ camera, fromMs })) });
  }
  function endCuts() {
    const cuts = viewer.camera.getCameraCuts();
    if (cuts && cuts.entityId === seq.entityId) viewer.camera.clearCameraCuts();
  }

  const offs = [
    viewer.events.on("animation.finished", (state) => {
      if (!owned || !isMine(state)) return;
      if (loop) viewer.animations.resume();
      else tick(false);
      emit();
    }),
    viewer.events.on("animation.cancelled", (state) => {
      if (starting || !owned || !isMine(state)) return;
      owned = false;
      tick(false);
      if (live()) endCuts();
      emit();
    }),
    viewer.events.on("camera.cutChanged", emit),
  ];

  function play() {
    starting = true;
    try { viewer.animations.playClip(seq.entityId, seq.clip, { loop: false }); } finally { starting = false; }
    owned = true;
    startCuts();
    tick(true);
  }

  const run = (action) => {
    if (!live() || !available) return;
    try { action(); } finally { emit(); }
  };

  return {
    snapshot: () => (live() ? snapshot() : { ...idleMotion }),
    /** 切换序列：停止当前播放并复位。 */
    select: (next) => {
      if (!live()) return;
      tick(false);
      endCuts();
      if (owned && isMine(viewer.animations.getState())) viewer.animations.stop();
      owned = false;
      const wasFollowing = follow;
      select(next);
      follow = cameras && wasFollowing;
      emit();
    },
    toggle: () => run(() => {
      const state = viewer.animations.getState();
      if (!owned || !isMine(state)) { play(); return; }
      if (state.playing) { viewer.animations.pause(); tick(false); return; }
      viewer.animations.resume();
      startCuts();
      tick(true);
    }),
    seek: (timeMs) => run(() => { if (owned && isMine(viewer.animations.getState())) viewer.animations.seek(timeMs); }),
    setRate: (rate) => run(() => { if (owned && isMine(viewer.animations.getState())) viewer.animations.setRate(rate); }),
    setLoop: (value) => run(() => { loop = Boolean(value); }),
    setFollow: (value) => run(() => {
      follow = Boolean(value) && cameras;
      if (follow && owned && isMine(viewer.animations.getState())) startCuts();
      else endCuts();
    }),
    /** 停止并复位模型到初始姿态，恢复播放前的视角。 */
    stop: () => run(() => {
      tick(false);
      endCuts();
      if (owned && isMine(viewer.animations.getState())) viewer.animations.stop();
      owned = false;
    }),
    dispose() {
      if (disposed) return;
      tick(false);
      if (live()) {
        endCuts();
        if (owned && isMine(viewer.animations.getState())) viewer.animations.stop();
      }
      owned = false;
      disposed = true;
      offs.forEach((off) => off());
    },
  };
}
