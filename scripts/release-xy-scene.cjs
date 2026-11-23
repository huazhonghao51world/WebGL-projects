const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

// One release pipeline for everything the scene team delivers to P4 `assets/xy-factory/`:
//   models (GLB, animation embedded), point anchors (L_BP.glb) and the scene profile package.
// Each item is fingerprinted (sha256) and compared with what the XY case draft already carries; only changed items
// are converted / imported / uploaded, then the case is published once. The page follows the published revision
// automatically (delivery auto-update), so the scene team never touches the platform.
//
//   set XY_PLATFORM_USER / XY_PLATFORM_PASSWORD
//   node scripts/release-xy-scene.cjs <delivery-root (…/assets/xy-factory)> <api-url> [--dry-run] [--config file] [--scene id]
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? undefined : args.splice(i, 2)[1]; };
const dryRun = args.includes('--dry-run') && Boolean(args.splice(args.indexOf('--dry-run'), 1));
const config = JSON.parse(fs.readFileSync(flag('--config') || path.join(__dirname, 'xy-release.config.json'), 'utf8'));
const sceneId = flag('--scene') || config.sceneId;
const [root, server] = args;
const { XY_PLATFORM_USER: username, XY_PLATFORM_PASSWORD: password } = process.env;
const log = (...values) => console.error(...values);
let cookie;

async function sha256(file) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function request(endpoint, options = {}) {
  const { json, headers, ...init } = options;
  const response = await fetch(`${server.replace(/\/$/, '')}${endpoint}`, {
    ...init,
    signal: AbortSignal.timeout(600000),
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json ? JSON.stringify(json) : init.body,
  });
  if (endpoint === '/session') cookie = response.headers.getSetCookie()[0]?.split(';')[0];
  const data = await response.json();
  if (!response.ok) { const error = new Error(`${endpoint}: ${response.status} ${data.message || ''}`); error.status = response.status; throw error; }
  return { data, etag: response.headers.get('etag') };
}
function run(script, scriptArgs) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script), ...scriptArgs], { stdio: ['ignore', 'inherit', 'inherit'] });
  if (result.status !== 0) throw new Error(`${script} 失败（退出码 ${result.status}）`);
}

/* ------------------------------------------------------------------ anchors (L_BP.glb → plain point list) */
function quatRotate([x, y, z], [qx, qy, qz, qw]) {
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  return [x + qw * tx + (qy * tz - qz * ty), y + qw * ty + (qz * tx - qx * tz), z + qw * tz + (qx * ty - qy * tx)];
}
function readAnchors(file, sourceSha256) {
  const raw = fs.readFileSync(file);
  const doc = JSON.parse(raw.toString('utf8', 20, 20 + raw.readUInt32LE(12)));
  const parents = new Map();
  doc.nodes.forEach((node, index) => (node.children || []).forEach((child) => parents.set(child, index)));
  const world = (index) => {
    let point = [0, 0, 0];
    for (let at = index; at !== undefined; at = parents.get(at)) {
      const node = doc.nodes[at];
      if (node.matrix) throw new Error(`${path.basename(file)}: 节点 ${node.name} 使用 matrix，请导出 TRS`);
      const scale = node.scale || [1, 1, 1];
      point = quatRotate(point.map((value, axis) => value * scale[axis]), node.rotation || [0, 0, 0, 1]).map((value, axis) => value + (node.translation || [0, 0, 0])[axis]);
    }
    return point.map((value) => Number(value.toFixed(6)));
  };
  const anchors = doc.nodes.flatMap((node, index) => (node.mesh === undefined && node.camera === undefined && !(node.children || []).length && node.name
    ? [{ sourceNodeIndex: index, sourceName: node.name, kind: /摄像头|camera/i.test(node.name) ? 'camera-location' : 'building-label', position: world(index), businessId: null }]
    : []));
  if (!anchors.length) throw new Error(`${path.basename(file)} 中没有点位节点`);
  return { sourceSha256, coordinateSpace: 'glTF world XYZ (metres, Y up)', anchors };
}

/* ------------------------------------------------------------------ scene profile package (customApi) */
const semver = (value) => { const m = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(value || ''); if (!m) throw new Error(`版本号不是 semver：${value}`); return m.slice(1, 4).map(Number); };
const newer = (a, b) => { const x = semver(a); const y = semver(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };
function readProfile(dir) {
  const spec = config.profile;
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const code = fs.readFileSync(path.join(dir, manifest.entry || 'index.js'), 'utf8');
  const problems = [];
  if (manifest.schema !== 'twin-custom-api-package/1') problems.push('manifest.schema 应为 twin-custom-api-package/1');
  if (manifest.packageId !== spec.packageId) problems.push(`packageId 应为 ${spec.packageId}`);
  if (!manifest.contract || manifest.contract.id !== spec.contract || Number(String(manifest.contract.version).split('.')[0]) !== spec.contractMajor) {
    problems.push(`contract 应为 { id: "${spec.contract}", version: "${spec.contractMajor}.x" }`);
  }
  semver(manifest.version);
  for (const name of spec.functions) {
    const fn = (manifest.functions || []).find((item) => item.name === name);
    if (!fn) problems.push(`缺少约定函数 ${name}`);
    else if (fn.version !== spec.contractMajor) problems.push(`${name} 的 version 应为 ${spec.contractMajor}`);
  }
  const hash = crypto.createHash('sha256').update(Buffer.from(code, 'utf8')).digest('hex');
  if (hash !== manifest.sha256) problems.push(`入口文件 sha256 与 manifest 不一致（实际 ${hash}），请场景组重新构建`);
  if (problems.length) throw new Error(`场景配置包不符合约定：\n- ${problems.join('\n- ')}`);
  return { manifest, code };
}

/* ------------------------------------------------------------------ animation precision guard */
// Quantized animation (Meshopt EXPONENTIAL / QUATERNION filters or integer output accessors) makes devices and
// cameras step visibly. The scene team exports Float32 animation; refuse a delivery that regressed.
function assertAnimationPrecision(file) {
  const raw = fs.readFileSync(file);
  const doc = JSON.parse(raw.toString('utf8', 20, 20 + raw.readUInt32LE(12)));
  const bad = new Set();
  for (const animation of doc.animations || []) for (const sampler of animation.samplers) {
    const accessor = doc.accessors[sampler.output];
    const view = doc.bufferViews[accessor.bufferView];
    const filter = view && view.extensions && view.extensions.EXT_meshopt_compression && view.extensions.EXT_meshopt_compression.filter;
    if (accessor.componentType !== 5126 || (filter && filter !== 'NONE')) bad.add(`${animation.name || 'animation'}（${accessor.componentType !== 5126 ? '整数量化' : `${filter} 滤波`}）`);
  }
  if (bad.size) throw new Error(`${path.basename(file)} 的动画数据被量化，播放会抖动，已停止发布：${[...bad].join('、')}。请场景组导出时保持动画为 Float32、不加 Meshopt 滤波。`);
}

/* ------------------------------------------------------------------ plan */
async function plan(draft, published, assets) {
  const entities = new Map(draft.entities.map((entity) => [entity.entityId, entity]));
  const originals = new Map(assets.map((asset) => [`${asset.assetId}@${asset.assetRevision}`, asset.source && asset.source.originalHash]));
  const changes = [];
  for (const model of config.models) {
    const file = path.join(root, model.file);
    const entity = entities.get(model.entityId);
    if (!fs.existsSync(file)) {
      if (!entity) throw new Error(`交付目录缺少 ${model.file}，且场景中还没有 ${model.entityId}`);
      log(`跳过 ${model.file}：交付目录中没有该文件，保留场景现有版本`);
      continue;
    }
    const source = { file: model.file, sha256: await sha256(file) };
    const current = entity && entity.customData && entity.customData.source;
    if (current && current.sha256 === source.sha256) continue;
    assertAnimationPrecision(file);
    // Entities imported before fingerprints existed: the platform keeps the original's hash, so an identical
    // file only needs its fingerprint recorded, not a re-import.
    const original = entity && entity.assetRef && originals.get(`${entity.assetRef.assetId}@${entity.assetRef.assetRevision}`);
    if (!current && original === source.sha256) { changes.push({ type: 'fingerprint', model, source, entity, reason: '登记指纹（内容未变）' }); continue; }
    changes.push({ type: 'model', model, file, source, entity, reason: entity ? '内容变化' : '新增' });
  }
  const anchorFile = path.join(root, config.anchors.file);
  if (fs.existsSync(anchorFile)) {
    const sha = await sha256(anchorFile);
    const entity = entities.get(config.anchors.entityId);
    const current = entity && entity.customData && entity.customData.source;
    if (!current || current.sha256 !== sha) changes.push({ type: 'anchors', data: readAnchors(anchorFile, sha), source: { file: config.anchors.file, sha256: sha }, reason: current ? '内容变化' : '新增' });
  }
  const profileDir = path.join(root, config.profile.dir);
  if (fs.existsSync(path.join(profileDir, 'manifest.json'))) {
    const pkg = readProfile(profileDir);
    const live = (published.definitions || []).find((item) => item.package && item.package.packageId === config.profile.packageId);
    if (live && pkg.manifest.sha256 === live.package.hash) {
      if (pkg.manifest.version !== live.package.packageVersion) log(`场景配置包 ${pkg.manifest.version} 的代码与已发布的 ${live.package.packageVersion} 相同，无需发布`);
    } else if (!live || newer(pkg.manifest.version, live.package.packageVersion)) changes.push({ type: 'profile', pkg, from: live ? live.package.packageVersion : null, reason: live ? `${live.package.packageVersion} → ${pkg.manifest.version}` : `首次 ${pkg.manifest.version}` });
    else log(`场景配置包 ${pkg.manifest.version} 未高于已发布的 ${live.package.packageVersion}，未上传（请场景组提升版本号）`);
  }
  return changes;
}

/* ------------------------------------------------------------------ execute */
async function importModel(change, work) {
  const { model, file, source } = change;
  const name = path.basename(file);
  const normalized = path.join(work, `${model.entityId}-normalized`);
  run('prepare-xy-assets.cjs', [path.dirname(file), normalized, config.platformRoot, name]);
  const upload = path.join(normalized, name);
  const form = new FormData();
  form.append('model', await fs.openAsBlob(upload), name);
  form.append('original', await fs.openAsBlob(file), name);
  form.append('metadata', JSON.stringify({ mode: 'auto', assetId: model.assetId, name: model.name, sourceFormat: 'glb', licenseAcknowledged: true, warnings: [] }));
  const job = (await request('/assets/import', { method: 'POST', body: form })).data;
  for (let attempt = 0; attempt < 900; attempt += 1) {
    const current = (await request(`/jobs/${job.id}`)).data;
    if (current.status === 'failed') throw new Error(`${name}: ${JSON.stringify(current.error)}`);
    if (current.status === 'ready') {
      const asset = (await request('/assets')).data.find((item) => item.assetId === model.assetId && item.assetRevision === current.assetRevision);
      log(`导入 ${name} → ${asset.assetId}@${asset.assetRevision}${asset.report.animations.length ? `，动画 ${asset.report.animations.join(', ')}` : ''}`);
      return { assetId: asset.assetId, assetRevision: asset.assetRevision, contentHash: asset.contentHash, metadataHash: asset.metadataHash };
    }
    await delay(1000);
  }
  throw new Error(`${name}: 平台导入超时`);
}

function upsertEntity(doc, entity) {
  const index = doc.entities.findIndex((item) => item.entityId === entity.entityId);
  if (index < 0) doc.entities.push(entity);
  else doc.entities[index] = entity;
}

async function main() {
  if (!root || !server || !username || !password) {
    throw new Error('用法：设置 XY_PLATFORM_USER / XY_PLATFORM_PASSWORD 后运行 node scripts/release-xy-scene.cjs <交付目录 …/assets/xy-factory> <平台 API 地址> [--dry-run]');
  }
  await request('/session', { method: 'POST', json: { username, password } });
  const exists = (await request('/scenes')).data.some((scene) => scene.sceneId === sceneId);
  const draftResponse = exists ? await request(`/scenes/${sceneId}/draft`) : null;
  const doc = exists ? draftResponse.data.document : {
    schemaVersion: '1.0.0', projectId: 'industrial-demo', sceneId, sceneRevision: 'draft', name: config.sceneName || 'XY工厂 · 园区数字孪生',
    coordinateSystem: { kind: 'local', unit: 'm', upAxis: 'Y', handedness: 'right' },
    assets: [], entities: [], bookmarks: config.bookmarks || [], environment: { background: '#14283a', ground: false },
  };
  const published = exists ? (await request(`/scenes/${sceneId}/custom-apis?revision=published`).catch(() => ({ data: {} }))).data : {};
  const changes = await plan(doc, published, (await request('/assets')).data);
  const label = (c) => (c.type === 'model' || c.type === 'fingerprint' ? c.model.file : c.type === 'anchors' ? config.anchors.file : config.profile.packageId);
  for (const change of changes) log(`待发布：${label(change)}（${change.reason}）`);
  if (!changes.length) { console.log(JSON.stringify({ sceneId, changed: [], published: false })); log('交付目录与已发布场景一致，无需发布'); return; }
  if (dryRun) { console.log(JSON.stringify({ sceneId, changed: changes.map(label), dryRun: true })); return; }

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'xy-release-'));
  try {
    for (const change of changes.filter((item) => item.type === 'fingerprint')) {
      upsertEntity(doc, { ...change.entity, customData: { ...(change.entity.customData || {}), source: change.source } });
    }
    for (const change of changes.filter((item) => item.type === 'model')) {
      const ref = await importModel(change, work);
      doc.assets = doc.assets.filter((asset) => asset.assetId !== ref.assetId).concat(ref);
      const previous = change.entity || { entityId: change.model.entityId, kind: 'model', transform: {}, customData: {} };
      upsertEntity(doc, {
        ...previous, name: previous.name || change.model.name, assetRef: { assetId: ref.assetId, assetRevision: ref.assetRevision },
        customData: { ...(previous.customData || {}), source: change.source },
      });
    }
    const anchors = changes.find((item) => item.type === 'anchors');
    if (anchors) {
      upsertEntity(doc, {
        entityId: config.anchors.entityId, name: config.anchors.name, kind: 'group', transform: {}, visible: true,
        customData: { kind: 'xy-anchors', ...anchors.data, source: anchors.source },
      });
      log(`点位 ${anchors.data.anchors.length} 个写入 ${config.anchors.entityId}`);
    }
    const referenced = new Set(doc.entities.filter((entity) => entity.assetRef).map((entity) => `${entity.assetRef.assetId}@${entity.assetRef.assetRevision}`));
    doc.assets = doc.assets.filter((asset) => referenced.has(`${asset.assetId}@${asset.assetRevision}`));

    let etag;
    if (exists) etag = (await request(`/scenes/${sceneId}/draft`, { method: 'PATCH', headers: { 'If-Match': draftResponse.etag }, json: doc })).etag;
    else { await request('/scenes', { method: 'POST', json: doc }); etag = (await request(`/scenes/${sceneId}/draft`)).etag; }

    const profile = changes.find((item) => item.type === 'profile');
    if (profile) {
      const { manifest, code } = profile.pkg;
      const stored = (await request('/custom-api-packages', { method: 'POST', json: { sceneId, manifest, code } })).data;
      for (const warning of stored.warnings || []) log(`平台警告：${warning}`);
      const draftApis = (await request(`/scenes/${sceneId}/custom-apis?revision=draft`)).data;
      const ours = new Set(manifest.functions.map((fn) => fn.name));
      await request(`/scenes/${sceneId}/custom-apis`, { method: 'PUT', json: { bindings: [
        ...draftApis.bindings.filter((item) => !ours.has(item.name)),
        ...manifest.functions.map((fn) => ({ name: fn.name, featureId: fn.featureId || `${manifest.packageId}.${fn.name}`, version: fn.version, packageHash: stored.hash })),
      ] } });
      log(`场景配置包 ${manifest.packageId}@${manifest.version} 已绑定`);
    }
    const release = (await request(`/scenes/${sceneId}/releases`, { method: 'POST', headers: { 'If-Match': etag }, json: {} })).data;
    console.log(JSON.stringify({ sceneId, revision: release.revision, changed: changes.map(label) }));
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
