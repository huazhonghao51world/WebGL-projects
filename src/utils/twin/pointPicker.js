/**
 * 取点工具：在模型表面单击依次取点，用于手工采集路线（如应急疏散路径）。
 * 单击取点（拖动视角不取点），退格撤销，Esc 结束；页面负责显示点列表、预览线与复制。
 * 取到的点在场景中以 Path 覆盖物预览（每次变化重建），结束时删除。
 */
export function startPointPicker(viewer, canvas, render) {
  let points = [];
  let down = null;
  let disposed = false;
  let preview = [];
  let version = 0;
  const previousCursor = canvas.style.cursor;
  canvas.style.cursor = "crosshair";

  const round = (value) => Math.round(value * 100) / 100;
  function pick({ clientX, clientY }) {
    if (viewer.getState() !== "ready") return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const point = viewer.picking.worldPointByScreenPos(x, y);
    return point ? point.map(round) : null;
  }
  async function redraw() {
    const mine = ++version;
    const old = preview;
    preview = [];
    if (old.length) await viewer.scene.delete(old).catch(() => {});
    if (disposed || mine !== version || viewer.getState() !== "ready") return;
    const coverings = points.map((p) => ({ type: "Range", entityName: "XY取点", circlePolygon2D: { center: [p[0], p[2]], radius: 0.35, coordZ: p[1] + 0.04 }, rangeStyle: { type: "none", fillAreaType: "solid", height: 0, strokeWeight: 0.06, color: "ffffffff", fillAreaColor: "35f0b0ee" } }));
    const lifted = points.map(([x, y, z]) => [x, y + 0.1, z]);
    if (lifted.length >= 2) coverings.push({ type: "Path", entityName: "XY取点路线", polyline: { coordinates: lifted }, pathStyle: { preset: "flow_light", width: 1.2 } });
    if (!coverings.length) return;
    try {
      const created = await viewer.scene.creates(coverings);
      if (disposed || mine !== version) { await viewer.scene.delete(created).catch(() => {}); return; }
      preview = created;
    } catch (error) { console.warn("[xy-picker] 预览失败", error); }
  }
  function changed() { render({ points: points.slice() }); redraw(); }

  function onDown(event) { if (event.button === 0) down = { id: event.pointerId, x: event.clientX, y: event.clientY }; }
  function onUp(event) {
    if (!down || down.id !== event.pointerId) return;
    const start = down;
    down = null;
    if (event.button !== 0 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;
    const point = pick(event);
    if (!point) return;
    viewer.selection.clear();
    points.push(point);
    changed();
  }
  function onKey(event) {
    if (event.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (event.key === "Escape") { event.preventDefault(); cancel(); return; }
    if (event.key === "Backspace" && points.length) { event.preventDefault(); points = points.slice(0, -1); changed(); }
  }
  const listeners = { pointerdown: onDown, pointerup: onUp };
  Object.entries(listeners).forEach(([type, listener]) => canvas.addEventListener(type, listener));
  window.addEventListener("keydown", onKey, true);

  function cancel() {
    if (disposed) return;
    disposed = true;
    canvas.style.cursor = previousCursor;
    Object.entries(listeners).forEach(([type, listener]) => canvas.removeEventListener(type, listener));
    window.removeEventListener("keydown", onKey, true);
    if (preview.length) viewer.scene.delete(preview).catch(() => {});
    preview = [];
    render(null);
  }
  render({ points: [] });
  return {
    cancel,
    undo() { if (points.length) { points = points.slice(0, -1); changed(); } },
    clear() { points = []; changed(); },
  };
}

/** 导出格式：可直接粘贴到 layers.js 的路线 points。 */
export function formatPoints(points) {
  return `[${points.map((p) => `[${p.join(", ")}]`).join(", ")}]`;
}
