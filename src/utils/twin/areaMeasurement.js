/** 水平投影面积（XZ 平面）与沿空间顶点的闭合周长，单位为米。 */
export function polygonMetrics(points) {
  if (points.length < 3) return null;
  const [x0, , z0] = points[0];
  let twiceArea = 0;
  let perimeter = 0;
  points.forEach(([x, y, z], index) => {
    const [nx, ny, nz] = points[(index + 1) % points.length];
    twiceArea += (x - x0) * (nz - z0) - (nx - x0) * (z - z0);
    perimeter += Math.hypot(nx - x, ny - y, nz - z);
  });
  return { area: Math.abs(twiceArea) / 2, perimeter };
}

/** 使用公共 SDK 的拾取和坐标投影，业务页面自行渲染标记和测量读数。 */
export function startAreaMeasurement(viewer, canvas, render) {
  let points = [];
  let hover = null;
  let down = null;
  let active = true;
  let disposed = false;
  let frame = null;
  let pendingMove = null;
  const previousCursor = canvas.style.cursor;
  canvas.style.cursor = "crosshair";

  function pick({ clientX, clientY }) {
    if (viewer.getState() !== "ready") return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    return viewer.picking.worldPointByScreenPos(x, y);
  }

  function draw() {
    const ring = hover ? [...points, hover] : points;
    const metrics = polygonMetrics(ring);
    const y = ring.reduce((max, point) => Math.max(max, point[1]), -Infinity) + 0.04;
    const projected = viewer.getState() === "ready" ? ring.map(([x, , z]) => viewer.coordinates.worldToScreen([x, y, z])) : [];
    const onScreen = projected.length && projected.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && point.depth >= -1 && point.depth <= 1);
    render({ active, count: points.length, metrics, preview: Boolean(hover), screen: onScreen ? projected : [] });
  }

  function schedule(point = null) {
    if (disposed) return;
    if (point) pendingMove = point;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (pendingMove && active) hover = pick(pendingMove);
      pendingMove = null;
      draw();
    });
  }

  function clearHover() { pendingMove = null; hover = null; }
  function onDown(event) { if (event.button === 0) down = { id: event.pointerId, x: event.clientX, y: event.clientY }; }
  function onUp(event) {
    if (!down || down.id !== event.pointerId) return;
    const start = down;
    down = null;
    if (event.button !== 0 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;
    const point = pick(event);
    // The SDK treats the same pointer event as a normal scene selection; remove that transient outline.
    if (point) viewer.selection.clear();
    if (point && !points.some((other) => Math.hypot(point[0] - other[0], point[2] - other[2]) < 0.01)) points.push(point);
    clearHover();
    draw();
  }
  function onMove(event) {
    if (points.length && !event.buttons) schedule({ clientX: event.clientX, clientY: event.clientY });
    else if (hover || pendingMove) { clearHover(); schedule(); }
  }
  function onLeave() { down = null; clearHover(); schedule(); }
  function onKey(event) {
    if (event.key === "Escape") { event.preventDefault(); cancel(); return; }
    if (!active) return;
    if (event.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (event.key === "Enter" && !event.target.closest?.("button, a")) { event.preventDefault(); finish(); }
    if (event.key === "Backspace") { event.preventDefault(); points = points.slice(0, -1); clearHover(); draw(); }
  }
  function finish() {
    if (points.length < 3) return;
    stopPicking();
    draw();
  }
  const pickingListeners = { pointerdown: onDown, pointerup: onUp, pointermove: onMove, pointerleave: onLeave, pointercancel: onLeave, dblclick: finish };
  function stopPicking() {
    if (!active) return;
    active = false;
    clearHover();
    canvas.style.cursor = previousCursor;
    Object.entries(pickingListeners).forEach(([type, listener]) => canvas.removeEventListener(type, listener));
  }
  function cancel() {
    if (disposed) return;
    disposed = true;
    stopPicking();
    window.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", onResize);
    offCamera();
    if (frame !== null) cancelAnimationFrame(frame);
    render(null);
  }
  function onResize() { schedule(); }
  const offCamera = viewer.events.on("camera.changed", onResize);
  window.addEventListener("resize", onResize);
  // Keep Escape available to clear a completed result, while leaving other shortcuts alone.
  Object.entries(pickingListeners).forEach(([type, listener]) => canvas.addEventListener(type, listener));
  window.addEventListener("keydown", onKey, true);
  draw();
  return { cancel };
}
