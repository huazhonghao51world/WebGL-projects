const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const [source, output, platform, ...requested] = process.argv.slice(2);
if (!source || !output || !platform || path.resolve(source) === path.resolve(output)) {
  throw new Error('Usage: node scripts/prepare-xy-assets.cjs <source-models> <new-output-directory> <twin-platform-root> [file.glb ...]');
}
const filenames = requested.length ? requested : ['L_Building.glb', 'L_Building2.glb'];
const platformRequire = createRequire(path.resolve(platform, 'package.json'));
const { MeshoptDecoder } = platformRequire('meshoptimizer');
const validator = platformRequire('gltf-validator');
const align = (size) => Math.ceil(size / 4) * 4;

async function normalize(filename) {
  const raw = fs.readFileSync(path.join(source, filename));
  const jsonLength = raw.readUInt32LE(12);
  const doc = JSON.parse(raw.toString('utf8', 20, 20 + jsonLength));
  const binary = raw.subarray(28 + jsonLength);
  const meshopt = 'EXT_meshopt_compression';
  const webp = 'EXT_texture_webp';
  if (raw.readUInt32LE(0) !== 0x46546c67 || raw.readUInt32LE(4) !== 2 || raw.readUInt32LE(8) !== raw.length || raw.readUInt32LE(16) !== 0x4e4f534a || raw.readUInt32LE(24 + jsonLength) !== 0x004e4942 || doc.buffers[0].byteLength > binary.length || doc.buffers.some((buffer) => buffer.uri)) {
    throw new Error(`${filename}: expected a self-contained GLB 2.0`);
  }
  let length = 0;
  const segments = doc.bufferViews.map((view) => {
    const compressed = view.extensions && view.extensions[meshopt];
    const storage = compressed || view;
    const start = storage.byteOffset || 0;
    if (storage.buffer !== 0 || start + storage.byteLength > binary.length) throw new Error(`Unknown source buffer in ${filename}`);
    let bytes = binary.subarray(start, start + storage.byteLength);
    if (compressed) {
      const decoded = Buffer.alloc(compressed.count * compressed.byteStride);
      if (decoded.length !== view.byteLength) throw new Error(`Invalid decoded view size in ${filename}`);
      MeshoptDecoder.decodeGltfBuffer(decoded, compressed.count, compressed.byteStride, bytes, compressed.mode, compressed.filter);
      bytes = decoded;
      delete view.extensions[meshopt];
      if (!Object.keys(view.extensions).length) delete view.extensions;
    }
    view.buffer = 0;
    view.byteOffset = length;
    length += align(bytes.length);
    return { bytes, offset: view.byteOffset };
  });
  doc.buffers = [{ byteLength: length }];
  doc.extensionsUsed = (doc.extensionsUsed || []).filter((name) => name !== meshopt);
  doc.extensionsRequired = (doc.extensionsRequired || []).filter((name) => name !== meshopt);
  for (const texture of doc.textures || []) {
    if (doc.images[texture.source]?.mimeType !== 'image/webp') continue;
    texture.extensions = { ...texture.extensions, [webp]: { source: texture.source } };
    delete texture.source;
    if (!doc.extensionsUsed.includes(webp)) doc.extensionsUsed.push(webp);
    if (!doc.extensionsRequired.includes(webp)) doc.extensionsRequired.push(webp);
  }
  const json = Buffer.from(JSON.stringify(doc));
  const padded = align(json.length);
  const result = Buffer.alloc(28 + padded + length);
  result.writeUInt32LE(0x46546c67, 0);
  result.writeUInt32LE(2, 4);
  result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(padded, 12);
  result.writeUInt32LE(0x4e4f534a, 16);
  result.fill(32, 20, 20 + padded);
  json.copy(result, 20);
  result.writeUInt32LE(length, 20 + padded);
  result.writeUInt32LE(0x004e4942, 24 + padded);
  for (const segment of segments) segment.bytes.copy(result, 28 + padded + segment.offset);
  const { issues } = await validator.validateBytes(result, { maxIssues: 20 });
  if (issues.numErrors) throw new Error(`${filename}: ${JSON.stringify(issues.messages.filter((issue) => issue.severity === 0))}`);
  fs.writeFileSync(path.join(output, filename), result, { flag: 'wx' });
  console.log(`${filename}: ${result.length} bytes, ${issues.numErrors} errors, ${issues.numWarnings} warnings`);
}

async function main() {
  await MeshoptDecoder.ready;
  fs.mkdirSync(output, { recursive: false });
  for (const filename of filenames) await normalize(filename);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
