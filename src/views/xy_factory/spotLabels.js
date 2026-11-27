// 场景内悬浮解说卡（与灯塔工厂“总览讲解” showSpotLabels 同一形式）：落点 + 引线 + 卡片（色条 / 标题 / 分行说明），
// 卡片为屏幕等大的 Sprite，淡入；多张卡片在屏幕空间自动上推避让。
const KEY = "xy.spots";
const POI_UP = 58;
const POI_DOWN = 6;
const POI_LEFT = 24;
const POI_RIGHT = 110;

function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const ch of String(text || "")) {
    if (ctx.measureText(line + ch).width > maxWidth && line) { lines.push(line); line = ch; } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}

function card(T, title, { size = 22, accent = "#facc15", sub = "", maxWidth = 460, index = "" } = {}) {
  const dpr = 2;
  const canvas = document.createElement("canvas");
  const g = canvas.getContext("2d");
  const px = size * dpr;
  const font = `600 ${px}px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
  const subPx = Math.round(px * 0.66);
  const subFont = `400 ${subPx}px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
  g.font = subFont;
  const lines = sub ? wrap(g, sub, maxWidth * dpr) : [];
  const subWidth = Math.max(0, ...lines.map((l) => g.measureText(l).width));
  g.font = font;
  const badge = index ? g.measureText(index).width + px * 0.7 : 0;
  const titleWidth = g.measureText(title).width + badge;
  const padX = px * 0.6;
  const bar = 4 * dpr;
  const lineH = subPx * 1.5;
  const w = Math.ceil(Math.max(titleWidth, subWidth) + padX * 2 + bar);
  const h = Math.ceil(px * 1.7 + (lines.length ? lines.length * lineH + px * 0.35 : 0));
  canvas.width = w; canvas.height = h;
  const r = px * 0.28;
  const shape = () => {
    g.beginPath();
    g.moveTo(r, 0); g.lineTo(w - r, 0); g.quadraticCurveTo(w, 0, w, r);
    g.lineTo(w, h - r); g.quadraticCurveTo(w, h, w - r, h);
    g.lineTo(r, h); g.quadraticCurveTo(0, h, 0, h - r); g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
  };
  const bg = g.createLinearGradient(0, 0, w, 0);
  bg.addColorStop(0, "rgba(10,20,34,0.9)");
  bg.addColorStop(1, "rgba(10,20,34,0.82)");
  g.fillStyle = bg; shape(); g.fill();
  g.strokeStyle = accent; g.globalAlpha = 0.55; g.lineWidth = 1.5 * dpr; shape(); g.stroke();
  g.globalAlpha = 1;
  g.fillStyle = accent; g.fillRect(0, r * 0.6, bar, h - r * 1.2);
  g.textBaseline = "middle";
  g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 2 * dpr;
  let x = bar + padX * 0.8;
  const titleY = px * 0.88;
  if (index) {
    g.font = font; g.fillStyle = accent;
    g.fillText(index, x, titleY);
    x += badge;
  }
  g.font = font; g.fillStyle = "#ffffff";
  g.fillText(title, x, titleY);
  if (lines.length) {
    g.font = subFont; g.fillStyle = "rgba(226,236,248,0.88)";
    lines.forEach((l, i) => g.fillText(l, bar + padX * 0.8, px * 1.7 + px * 0.1 + lineH * (i + 0.5)));
  }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.minFilter = T.LinearFilter;
  texture.generateMipmaps = false;
  const material = new T.SpriteMaterial({ map: texture, depthTest: false, transparent: true, sizeAttenuation: false, opacity: 0 });
  const sprite = new T.Sprite(material);
  const scale = 0.00072 / dpr;
  sprite.scale.set(w * scale, h * scale, 1);
  sprite.center.set(0, 0);
  sprite.renderOrder = 999;
  sprite.userData.xyOverlay = true;
  sprite.userData.dispose = () => { texture.dispose(); material.dispose(); };
  return sprite;
}

/**
 * items: [{ position: [x, y, z], title, sub?, accent?, primary?, index? }]，position 为落点（对象顶面中心）。
 * options.avoid(): 返回需要避让的 POI 世界坐标（每帧读取）；卡片向上推到这些 POI 标签之上，不与之重叠。
 * 返回 dispose；同一时刻只保留一组（再次调用会先清除上一组）。
 */
export function showSpotLabels(viewer, items, options = {}) {
  const host = viewer.extensions;
  const T = host.THREE;
  const key = options.key || KEY;
  host.disposeState(key);
  const sprites = []; const kept = []; const tops = []; const lines = []; const dots = [];
  for (const entry of items || []) {
    if (!Array.isArray(entry.position)) continue;
    const base = new T.Vector3(...entry.position);
    const top = base.clone().setY(base.y + (entry.lift != null ? entry.lift : entry.primary ? 1.5 : 0.75));
    while (tops.some((p) => Math.hypot(p.x - top.x, p.z - top.z) < 1.6 && Math.abs(p.y - top.y) < 0.55)) top.y += 0.6;
    const sprite = card(T, entry.title, { size: entry.size || (entry.primary ? 22 : 15), accent: entry.accent || (entry.primary ? "#facc15" : "#38bdf8"), sub: entry.sub || "", index: entry.index || "", ...(entry.maxWidth ? { maxWidth: entry.maxWidth } : {}) });
    sprite.position.copy(top);
    sprites.push(sprite); kept.push(entry); tops.push(top);
    lines.push(base.x, base.y, base.z, top.x, top.y, top.z);
    dots.push(base.x, base.y, base.z);
  }
  if (!sprites.length) return () => {};
  const pin = new T.LineSegments(new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(lines, 3)), new T.LineBasicMaterial({ color: "#7dd3fc", transparent: true, opacity: 0, depthTest: false }));
  pin.renderOrder = 997;
  const points = new T.Points(new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(dots, 3)), new T.PointsMaterial({ color: "#e0f2fe", size: 8, sizeAttenuation: false, transparent: true, opacity: 0, depthTest: false }));
  points.renderOrder = 997;
  const group = new T.Group();
  group.name = "xy-spot-labels";
  group.userData.xyOverlay = true;
  group.add(pin, points, ...sprites);
  host.scene.add(group);

  // 屏幕空间避让：主卡优先，其余卡片沿相机上方向上推，引线随卡片伸长。
  const lift = sprites.map(() => 0);
  const side = sprites.map(() => 0);
  const baseSide = sprites.map(() => 0);
  const bases = sprites.map((_, i) => new T.Vector3(dots[i * 3], dots[i * 3 + 1], dots[i * 3 + 2]));
  const camUp = new T.Vector3(); const camRight = new T.Vector3(); const ndc = new T.Vector3(); const size = new T.Vector2();
  const hits = sprites.map(() => null);
  const dom = host.renderer.domElement;
  // 卡片可点击：按上一帧的屏幕矩形命中（Sprite 不参与场景拾取）。
  const onClick = options.onClick ? (e) => {
    const b = dom.getBoundingClientRect(); const x = e.clientX - b.left; const y = e.clientY - b.top;
    const i = hits.findIndex((r) => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (i >= 0) options.onClick(kept[i]);
  } : null;
  if (onClick) dom.addEventListener("click", onClick);
  const t0 = performance.now();
  const off = host.onFrame(() => {
    const camera = host.camera;
    host.renderer.getSize(size);
    const fade = Math.min(1, (performance.now() - t0) / 450);
    pin.material.opacity = 0.8 * fade;
    points.material.opacity = fade;
    camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const pxPerWorld = (d) => size.y / (2 * d * Math.tan(T.MathUtils.degToRad(camera.fov) / 2));
    const rects = sprites.map((sprite, index) => {
      sprite.material.opacity = Math.min(1, Math.max(0, fade * 1.6 - index * 0.06));
      ndc.copy(tops[index]).project(camera);
      const w = sprite.scale.x * camera.projectionMatrix.elements[0] * size.x / 2;
      const h = sprite.scale.y * camera.projectionMatrix.elements[5] * size.y / 2;
      return { index, x: (ndc.x + 1) / 2 * size.x, y: (1 - ndc.y) / 2 * size.y, w, h, visible: ndc.z < 1 };
    });
    const order = rects.filter((r) => r.visible).sort((a, b) => (kept[b.index].primary ? 1 : 0) - (kept[a.index].primary ? 1 : 0) || b.y - a.y);
    // POI 标签（图标 + 名称牌）约占锚点上方 POI_UP、左 POI_LEFT 到右 POI_RIGHT 的屏幕区域，作为障碍参与避让。
    const done = [];
    const covered = sprites.map(() => false);
    if (options.avoid) {
      for (const p of options.avoid() || []) {
        ndc.set(p[0], p[1], p[2]).project(camera);
        if (ndc.z >= 1 || Math.abs(ndc.x) > 1.1 || Math.abs(ndc.y) > 1.1) continue;
        const x = (ndc.x + 1) / 2 * size.x; const y = (1 - ndc.y) / 2 * size.y;
        rects.forEach((r) => { if (Math.hypot(r.x - x, r.y - y) < 70) covered[r.index] = true; });
        done.push({ x: x - POI_LEFT, w: POI_LEFT + POI_RIGHT, h: POI_UP + POI_DOWN, bottom: y + POI_DOWN });
      }
    }
    for (const rect of order) {
      // 落点与 POI 图标重合时，落点、引线、卡片整体向左让开图标，引线竖直落在图标左侧。
      const dodge = covered[rect.index] ? -(POI_LEFT + 34) : 0;
      rect.x += dodge;
      let bottom = rect.y;
      for (let guard = 0; guard < 20; guard++) {
        const hit = done.find((o) => rect.x < o.x + o.w + 6 && rect.x + rect.w + 6 > o.x && bottom > o.bottom - o.h - 4 && bottom - rect.h - 4 < o.bottom);
        if (!hit) break;
        bottom = hit.bottom - hit.h - 6;
      }
      done.push({ x: rect.x, w: rect.w, h: rect.h, bottom });
      // 近景时落点靠近屏幕上沿：卡片整体压回视口内（向下 / 向左平移，引线随之伸长）。
      const margin = 80;
      if (bottom - rect.h < margin) bottom = margin + rect.h;
      const shiftX = dodge + Math.min(0, size.x - margin - (rect.x + rect.w)) + Math.max(0, margin - rect.x);
      hits[rect.index] = { x: rect.x + shiftX - dodge, y: bottom - rect.h, w: rect.w, h: rect.h };
      baseSide[rect.index] = dodge / pxPerWorld(camera.position.distanceTo(bases[rect.index]));
      const ppw = pxPerWorld(camera.position.distanceTo(tops[rect.index]));
      const target = (rect.y - bottom) / ppw;
      lift[rect.index] += (target - lift[rect.index]) * 0.25;
      side[rect.index] += (shiftX / ppw - side[rect.index]) * 0.25;
    }
    const position = pin.geometry.attributes.position;
    const dotPos = points.geometry.attributes.position;
    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    sprites.forEach((sprite, index) => {
      sprite.position.copy(tops[index]).addScaledVector(camUp, lift[index]).addScaledVector(camRight, side[index]);
      position.setXYZ(index * 2 + 1, sprite.position.x, sprite.position.y, sprite.position.z);
      const from = bases[index].clone().addScaledVector(camRight, baseSide[index]);
      position.setXYZ(index * 2, from.x, from.y, from.z);
      dotPos.setXYZ(index, from.x, from.y, from.z);
    });
    position.needsUpdate = true;
    dotPos.needsUpdate = true;
  });
  const dispose = () => {
    off();
    if (onClick) dom.removeEventListener("click", onClick);
    group.removeFromParent();
    sprites.forEach((s) => s.userData.dispose());
    pin.geometry.dispose(); pin.material.dispose();
    points.geometry.dispose(); points.material.dispose();
  };
  host.state(key, () => ({ dispose }));
  return () => host.disposeState(key);
}

export function clearSpotLabels(viewer) {
  if (viewer && viewer.extensions) viewer.extensions.disposeState(KEY);
}
