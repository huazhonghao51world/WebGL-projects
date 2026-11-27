// 地面层切片栅格化：把 y=14.6 / 15.4 高度水平面与网格三角面的交线画进 0.25 m 占用栅格，膨胀 0.4 m 后 A* 求路径。
const vm = document.querySelector('.xy-campus').__vue__;
vm.setCutawayTo([]);
const v = vm.measureViewer; const T = v.extensions.THREE; const sc = v.extensions.scene;
const pass = /MEN|men3|PKM|JLM|zamen|Door|Caodi|DX0|tuopan|baoguo|box|Glass_生产楼|WindowGlass|guangfu|Ding|SnappyRoad|jinjiexian/i;
const [x0, z0, x1, z1] = ARGS.box; const S = 0.25;
const nx = Math.ceil((x1 - x0) / S); const nz = Math.ceil((z1 - z0) / S);
const occ = new Uint8Array(nx * nz);
const mark = (x, z) => { const i = Math.floor((x - x0) / S); const k = Math.floor((z - z0) / S); if (i >= 0 && k >= 0 && i < nx && k < nz) occ[k * nx + i] = 1; };
const line = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (S / 2)) + 1; for (let j = 0; j <= n; j++) mark(a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n); };
const va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3();
let tris = 0;
sc.traverse((o) => {
  if (!o.isMesh || !o.geometry || o.isInstancedMesh) return;
  for (let q = o; q; q = q.parent) { if (!q.visible) return; if (/^twin-|^xy-(focus|part|layout)/.test(q.name || '')) return; }
  if (pass.test(o.name || '') || pass.test((o.parent && o.parent.name) || '')) return;
  const bb = new T.Box3().setFromObject(o);
  if (bb.max.y < 14.2 || bb.min.y > 15.4 || bb.max.x < x0 || bb.min.x > x1 || bb.max.z < z0 || bb.min.z > z1) return;
  const pos = o.geometry.attributes.position; const index = o.geometry.index; const m = o.matrixWorld;
  const count = index ? index.count : pos.count;
  for (let t = 0; t < count; t += 3) {
    const ia = index ? index.getX(t) : t, ib = index ? index.getX(t + 1) : t + 1, ic = index ? index.getX(t + 2) : t + 2;
    va.fromBufferAttribute(pos, ia).applyMatrix4(m); vb.fromBufferAttribute(pos, ib).applyMatrix4(m); vc.fromBufferAttribute(pos, ic).applyMatrix4(m);
    for (const y of [14.6, 15.4]) {
      const pts = [];
      for (const [p, q] of [[va, vb], [vb, vc], [vc, va]]) {
        if ((p.y - y) * (q.y - y) < 0) { const s = (y - p.y) / (q.y - p.y); pts.push([p.x + (q.x - p.x) * s, p.z + (q.z - p.z) * s]); }
      }
      if (pts.length === 2) { line(pts[0], pts[1]); tris++; }
    }
  }
});
let bin = ""; for (let j = 0; j < occ.length; j++) bin += String.fromCharCode(occ[j]); return { nx, nz, S, x0, z0, tris, occ: btoa(bin) };