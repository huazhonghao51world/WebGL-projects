import { getTwinApp } from "@/utils/twin/app";

// 场景组交付的 UE Sequencer 序列（L_Prop.glb → 平台资产 xy-prop-sq3-v1 → 场景实体 xy-prop-sq3）。
// 运动全部来自 GLB 自带片段，前端只做播放控制；换版时只改这里。
export const sequence = {
  entityId: "xy-prop-sq3",
  clip: "SQ_3_likuquanjing_0",
  label: "库区序列 SQ_3",
  // UE 显示帧率与导出起始帧（GLB 第 0 秒 = 第 -3 帧）；切镜帧取自 Sequencer 的 Camera Cuts 区段。
  fps: 30,
  exportStartFrame: -3,
  shots: [
    { camera: "CineCameraActor_SQ3_1", label: "镜头 1", fromFrame: -3 },
    { camera: "CineCameraActor_SQ3_2", label: "镜头 2", fromFrame: 900 },
  ],
};

export const frameToMs = (frame, seq = sequence) => ((frame - seq.exportStartFrame) * 1000) / seq.fps;

export const idleMotion = {
  available: false, reason: "三维场景连接后可用", cameras: false, label: sequence.label, shots: [],
  follow: false, loop: false, active: false, playing: false, timeMs: 0, durationMs: 0, rate: 1, shot: null,
};

/** 播放场景 GLB 自带的动画片段，并可按 UE 切镜表跟随模型内置相机。onChange 收到可直接渲染的纯数据快照。 */
export function connectMotion(onChange, seq = sequence) {
  const app = getTwinApp();
  const viewer = app.viewer;
  const shots = seq.shots.map(({ camera, label, fromFrame }) => ({ camera, label, fromMs: frameToMs(fromFrame, seq) }));
  let available = false;
  let reason = "";
  try {
    available = viewer.scene.getClipNames(seq.entityId).includes(seq.clip);
    if (!available) reason = `场景模型缺少动画片段 ${seq.clip}`;
  } catch (error) {
    reason = "当前发布版没有带动画的道具模型";
  }
  let cameras = false;
  if (available) {
    try {
      const paths = viewer.camera.getNodeCameras(seq.entityId).map((item) => item.path);
      cameras = shots.every((shot) => paths.filter((path) => path.includes(shot.camera)).length === 1);
    } catch (error) { cameras = false; }
  }
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
