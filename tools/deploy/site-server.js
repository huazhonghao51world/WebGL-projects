// 通用站点服务器（零依赖）：静态托管 + 前缀反向代理。用于 TwinStudio 编辑器 / API 联调 / 演示站、新耀工厂大屏。
// 用法：node site-server.js --root <目录> --port <端口> [--proxy /api=127.0.0.1:5184] [--proxy /xy-video/hls=127.0.0.1:8888] [--strip /xy-video/hls]
//   --proxy 前缀=主机:端口   按前缀转发（可多次）；默认保留前缀，--strip 前缀 表示转发时去掉该前缀
//   --spa                   未命中文件时返回 index.html（history 路由）
//   --local 前缀            转发时把 Host / Origin 改为本机回环（平台 API 只接受回环来源），客户端 IP 变化无需改配置
//   --local-origin 端口     --local 改写 Origin 时使用的端口（需在平台 API 的可信来源端口内：5185/5186/5187/5188）
//   --file 路径=文件        用本机文件替换某个路径（如 /config.json=local/dengta-config.json），现场配置不随程序更新被覆盖；文件不存在时回落到 root
const http = require("http");
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const all = (name) => argv.flatMap((v, i) => (v === `--${name}` ? [argv[i + 1]] : []));
const one = (name, def) => all(name)[0] || def;
const root = path.resolve(one("root", "."));
const port = Number(one("port", 8080));
const spa = argv.includes("--spa");
const strip = new Set(all("strip"));
const local = new Set(all("local"));
const localOrigin = one("local-origin", "5185");
const files = new Map(all("file").map((v) => { const i = v.indexOf("="); return [v.slice(0, i), path.resolve(v.slice(i + 1))]; }));
const proxies = all("proxy").map((v) => { const [prefix, target] = v.split("="); const [host, p] = target.split(":"); return { prefix, host, port: Number(p) }; }).sort((a, b) => b.prefix.length - a.prefix.length);
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".mjs": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".bin": "application/octet-stream", ".wasm": "application/wasm", ".ktx2": "image/ktx2", ".mp4": "video/mp4", ".m3u8": "application/vnd.apple.mpegurl", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8" };

function proxy(req, res, rule) {
  const target = strip.has(rule.prefix) ? req.url.slice(rule.prefix.length) || "/" : req.url;
  const headers = { ...req.headers };
  // --local 前缀：以本机回环身份访问上游（平台 API 只信任回环 Host / Origin），浏览器侧换 IP、换网段都无需改配置。
  if (local.has(rule.prefix)) {
    headers.host = `127.0.0.1:${rule.port}`;
    if (headers.origin) headers.origin = `http://127.0.0.1:${localOrigin}`;
    delete headers.referer;
  }
  const up = http.request({ host: rule.host, port: rule.port, method: req.method, path: target, headers }, (r) => {
    const headers = { ...r.headers };
    if (strip.has(rule.prefix) && headers.location && headers.location.startsWith("/")) headers.location = rule.prefix + headers.location;
    if (headers["set-cookie"]) headers["set-cookie"] = headers["set-cookie"].map((c) => c.replace(/;\s*Secure/gi, "").replace(/;\s*Partitioned/gi, "").replace(/SameSite=None/gi, "SameSite=Lax"));
    res.writeHead(r.statusCode, headers);
    r.pipe(res);
  });
  up.on("error", (e) => { if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" }); res.end(`上游服务不可用（${rule.host}:${rule.port}）：${e.message}`); });
  req.pipe(up);
}

function send(req, res, file, size) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": types[ext] || "application/octet-stream", "Content-Length": size,
    // 带内容 hash 的构建资源长期缓存；入口页与配置不缓存，升级后立即生效。
    "Cache-Control": /[.-][0-9a-zA-Z_-]{8,}\.(js|css|woff2?)$/.test(path.basename(file)) ? "public, max-age=31536000, immutable" : "no-cache",
  });
  if (req.method === "HEAD") { res.end(); return; }
  fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res) {
  let rel;
  try { rel = decodeURIComponent(req.url.split("?")[0]); } catch { res.writeHead(400); res.end(); return; }
  const override = files.get(rel);
  if (override) {
    try { const st = fs.statSync(override); if (st.isFile()) return send(req, res, override, st.size); } catch { /* 回落到 root */ }
  }
  let file = path.normalize(path.join(root, rel));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) file = path.join(file, "index.html");
    fs.stat(file, (err2, st2) => {
      if (!err2 && st2.isFile()) return send(req, res, file, st2.size);
      if (spa && !path.extname(rel)) { const index = path.join(root, "index.html"); return fs.stat(index, (e3, s3) => (e3 ? (res.writeHead(404), res.end()) : send(req, res, index, s3.size))); }
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("Not Found");
    });
  });
}

http.createServer((req, res) => {
  const rule = proxies.find((p) => req.url === p.prefix || req.url.startsWith(p.prefix + "/") || req.url.startsWith(p.prefix + "?"));
  if (rule) return proxy(req, res, rule);
  return serveStatic(req, res);
}).listen(port, "0.0.0.0", () => console.log(`[site] :${port} root=${root} ${proxies.map((p) => `${p.prefix}->${p.host}:${p.port}${strip.has(p.prefix) ? "(strip)" : ""}`).join(" ")}`));
