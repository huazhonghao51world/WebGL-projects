const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const [server, normalized, originals] = process.argv.slice(2);
const { XY_PLATFORM_USER: username, XY_PLATFORM_PASSWORD: password } = process.env;
const sceneId = 'xy-factory';
const models = [
  { file: 'L_Building.glb', assetId: 'xy-campus-exterior-v1', name: 'XY园区外围' },
  { file: 'L_Building2.glb', assetId: 'xy-campus-core-v1', name: '生产楼与库区楼' },
];
let cookie;

async function request(endpoint, options = {}) {
  const { json, headers, ...init } = options;
  const response = await fetch(`${server.replace(/\/$/, '')}${endpoint}`, {
    ...init,
    signal: AbortSignal.timeout(180000),
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json ? JSON.stringify(json) : init.body,
  });
  if (endpoint === '/session') cookie = response.headers.getSetCookie()[0]?.split(';')[0];
  const data = await response.json();
  if (!response.ok) throw new Error(`${endpoint}: ${response.status} ${data.message || ''}`);
  return data;
}

async function upload(model) {
  const form = new FormData();
  form.append('model', await fs.openAsBlob(path.join(normalized, model.file)), model.file);
  form.append('original', await fs.openAsBlob(path.join(originals, model.file)), model.file);
  form.append('metadata', JSON.stringify({ mode: 'auto', assetId: model.assetId, name: model.name, sourceFormat: 'glb', licenseAcknowledged: true, warnings: [] }));
  const job = await request('/assets/import', { method: 'POST', body: form });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const current = await request(`/jobs/${job.id}`);
    if (current.status === 'ready') {
      const assets = await request('/assets');
      const asset = assets.find((item) => item.assetId === model.assetId && item.assetRevision === current.assetRevision);
      if (!asset) throw new Error(`Missing imported asset ${model.assetId}`);
      const { assetId, assetRevision, contentHash, metadataHash } = asset;
      console.error(`Validated ${model.file} as ${assetId}@${assetRevision}`);
      return { assetId, assetRevision, contentHash, metadataHash };
    }
    if (current.status === 'failed') throw new Error(`${model.file}: ${JSON.stringify(current.error)}`);
    await delay(1000);
  }
  throw new Error(`Asset worker timed out on ${model.file}`);
}

async function main() {
  if (!server || !normalized || !originals || !username || !password) throw new Error('Usage: set XY_PLATFORM_USER and XY_PLATFORM_PASSWORD, then run node scripts/publish-xy-campus.cjs <api-url> <normalized-models> <source-models>');
  await request('/session', { method: 'POST', json: { username, password } });
  if ((await request('/scenes')).some((scene) => scene.sceneId === sceneId)) throw new Error('XY case already exists; use the editor to review or update it.');
  const assets = [];
  for (const model of models) assets.push(await upload(model));
  const { version } = await request('/scenes', { method: 'POST', json: {
    schemaVersion: '1.0.0', projectId: 'industrial-demo', sceneId, sceneRevision: 'draft', name: 'XY工厂 · 园区数字孪生',
    coordinateSystem: { kind: 'local', unit: 'm', upAxis: 'Y', handedness: 'right' },
    assets,
    entities: assets.map(({ assetId, assetRevision }, index) => ({
      entityId: index ? 'xy-campus-core' : 'xy-campus-exterior', name: models[index].name, kind: 'model',
      assetRef: { assetId, assetRevision }, transform: {}, customData: { assetUsage: 'background' },
    })),
    bookmarks: [{ id: 'xy-overview', name: '园区全景', position: [164, 220, 284], target: [10, 17, -16] }],
    environment: { background: '#14283a', ground: false },
  } });
  const release = await request(`/scenes/${sceneId}/releases`, { method: 'POST', headers: { 'If-Match': `"${version}"` }, json: {} });
  const { code } = await request(`/scenes/${sceneId}/delivery-codes`, { method: 'POST', json: {} });
  console.log(JSON.stringify({ sceneId, revision: release.revision, deliveryCode: code }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
