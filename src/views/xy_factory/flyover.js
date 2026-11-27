// 相机巡航：回放 scripts/build-xy-flyovers.mjs 从 UE 镜头片段烘焙的相机轨迹（园区巡航 SQ_1、屋顶光伏巡航 SQ_2）。
// 只驱动相机，不占用 SDK 的动画通道，生产线照常运行。切镜表优先取发布流程写入的 customData.sequences。
import flyovers from "./flyovers.json";
import { publishedSequences } from "./motion";

const OWNER = "xy-flyover";
export const flyoverList = Object.entries(flyovers).map(([id, f]) => ({ id, name: f.name, desc: f.desc, durationMs: f.durationMs }));

/** 当前时刻用哪台相机：发布的切镜表 → 否则按相机顺序均分时长。 */
function shotPlan(viewer, def) {
  const published = publishedSequences(viewer).find((item) => item.clip.replace(/_\d+$/, "") === def.clip.replace(/_\d+$/, ""));
  const byName = new Map(def.cameras.map((c) => [c.camera, c]));
  const shots = published && published.shots && published.shots.length
    ? published.shots.map((s) => ({ fromMs: s.fromMs, camera: byName.get(s.camera) || def.cameras.find((c) => s.camera.includes(c.camera) || c.camera.includes(s.camera)) })).filter((s) => s.camera)
    : [];
  if (shots.length) return shots.sort((a, b) => a.fromMs - b.fromMs);
  return def.cameras.map((camera, index) => ({ fromMs: (def.durationMs * index) / def.cameras.length, camera }));
}

function sample(camera, rate, timeMs) {
  const f = (timeMs / 1000) * rate;
  const i = Math.min(camera.frames.length - 1, Math.floor(f));
  const j = Math.min(camera.frames.length - 1, i + 1);
  const k = f - i;
  return camera.frames[i].map((v, n) => v + (camera.frames[j][n] - v) * k);
}

/** 开始巡航；onEnd(reason) 在播完、被取消或出错时调用一次。返回 stop()。 */
export function playFlyover(viewer, id, onEnd) {
  const def = flyovers[id];
  if (!def) throw new Error(`未知巡航 ${id}`);
  const host = viewer.extensions;
  const camera = host.camera;
  const shots = shotPlan(viewer, def);
  const savedFov = camera.fov;
  const started = performance.now();
  let done = false;
  host.acquireCamera(OWNER);

  function finish(reason) {
    if (done) return;
    done = true;
    off();
    window.removeEventListener("keydown", onKey);
    try {
      camera.fov = savedFov;
      camera.updateProjectionMatrix();
      host.releaseCamera(OWNER);
    } catch (error) { /* 场景已卸载 */ }
    if (onEnd) onEnd(reason);
  }
  const onKey = (event) => { if (event.key === "Escape") finish("cancelled"); };
  window.addEventListener("keydown", onKey);

  const off = host.onFrame(() => {
    const t = performance.now() - started;
    if (t >= def.durationMs) { finish("finished"); return; }
    let shot = shots[0];
    for (const s of shots) if (s.fromMs <= t) shot = s;
    const [x, y, z, tx, ty, tz] = sample(shot.camera, def.rate, t);
    camera.position.set(x, y, z);
    camera.lookAt(tx, ty, tz);
    if (Math.abs(camera.fov - shot.camera.fov) > 0.01) { camera.fov = shot.camera.fov; camera.updateProjectionMatrix(); }
  });

  return { stop: () => finish("cancelled"), name: def.name, durationMs: def.durationMs };
}
