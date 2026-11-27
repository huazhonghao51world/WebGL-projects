// 平台数据热备份（服务运行中执行，不停机、不丢数据）：
//   1) SQLite 用 VACUUM INTO 生成一致性快照（WAL 中未合并的写入一并包含）；
//   2) 对象存储（objects/）为内容寻址文件，只增不改，按文件复制；
//   3) vtk-cache、交付码、访问密钥等 JSON 原样复制。
// 用法：node snapshot-data.mjs <源数据目录> <目标目录>
import { DatabaseSync } from "node:sqlite";
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const [src, dst] = process.argv.slice(2).map((p) => path.resolve(p));
if (!src || !dst) { console.error("用法：node snapshot-data.mjs <源数据目录> <目标目录>"); process.exit(2); }
await rm(dst, { recursive: true, force: true });
await mkdir(dst, { recursive: true });

const db = new DatabaseSync(path.join(src, "platform.sqlite"), { readOnly: true });
const target = path.join(dst, "platform.sqlite").replace(/'/g, "''");
db.exec(`VACUUM INTO '${target}'`);
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((r) => r.name);
const counts = Object.fromEntries(tables.map((t) => [t, db.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n]));
db.close();

let files = 0, bytes = 0;
for (const entry of await readdir(src, { withFileTypes: true })) {
  if (/^platform\.sqlite/.test(entry.name)) continue;
  await cp(path.join(src, entry.name), path.join(dst, entry.name), { recursive: true, preserveTimestamps: true });
}
async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) await walk(p); else { files++; bytes += (await stat(p)).size; } } }
await walk(dst);

// 校验：快照库可打开且行数一致
const check = new DatabaseSync(path.join(dst, "platform.sqlite"), { readOnly: true });
const mismatch = tables.filter((t) => check.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n !== counts[t]);
const integrity = check.prepare("PRAGMA integrity_check").get();
check.close();
console.log(JSON.stringify({ ok: !mismatch.length && Object.values(integrity)[0] === "ok", tables: counts, mismatch, files, megabytes: +(bytes / 1048576).toFixed(1) }, null, 1));
if (mismatch.length) process.exit(1);
