// 新耀工厂交付服务器：静态托管构建产物 + 视频网关反向代理（同源），零第三方依赖。
//   /                    → 构建产物（dist）
//   /xy-video/webrtc/*   → MediaMTX WebRTC（WHEP，默认 127.0.0.1:8889）
//   /xy-video/hls/*      → MediaMTX HLS（默认 127.0.0.1:8888）
// 浏览器只需访问本服务一个端口；WebRTC 媒体走 UDP/TCP 8189（ICE），不通时页面自动回退 HLS（纯 HTTP，经本代理）。
// 用法：node xy-server.js --root <dist 目录> --port 3716 [--webrtc 127.0.0.1:8889] [--hls 127.0.0.1:8888]
const http = require("http");
const fs = require("fs");
const path = require("path");

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
const root = path.resolve(arg("root", path.join(__dirname, "dist")));
const port = Number(arg("port", 3716));
const upstream = { webrtc: arg("webrtc", "127.0.0.1:8889"), hls: arg("hls", "127.0.0.1:8888") };
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".bin": "application/octet-stream", ".wasm": "application/wasm", ".vtk": "application/octet-stream", ".hdr": "application/octet-stream", ".ktx2": "image/ktx2", ".mp4": "video/mp4", ".m3u8": "application/vnd.apple.mpegurl" };

function proxy(req, res, target, prefix) {
  const [host, p] = target.split(":");
  const up = http.request({ host, port: Number(p), method: req.method, path: req.url.slice(prefix.length) || "/", headers: { ...req.headers, host: target } }, (r) => {
    const headers = { ...r.headers };
    // WHEP 返回的会话地址（Location）改写为同源代理路径，便于页面结束会话。
    if (headers.location && headers.location.startsWith("/")) headers.location = prefix + headers.location;
    // MediaMTX HLS 的 cookieCheck 下发 Secure Cookie，http 页面会被浏览器丢弃 → 去掉 Secure。
    if (headers["set-cookie"]) headers["set-cookie"] = headers["set-cookie"].map((c) => c.replace(/;\s*Secure/gi, "").replace(/;\s*Partitioned/gi, "").replace(/SameSite=None/gi, "SameSite=Lax"));
    res.writeHead(r.statusCode, headers);
    r.pipe(res);
  });
  up.on("error", (e) => { if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" }); res.end(`视频网关不可用：${e.message}`); });
  req.pipe(up);
}

function serveStatic(req, res) {
  let file = decodeURIComponent(req.url.split("?")[0]);
  file = path.normalize(path.join(root, file));
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) file = path.join(file, "index.html");
    fs.stat(file, (err2, st2) => {
      if (err2 || !st2.isFile()) { res.writeHead(404); res.end("Not Found"); return; }
      const ext = path.extname(file).toLowerCase();
      const headers = { "Content-Type": types[ext] || "application/octet-stream", "Content-Length": st2.size };
      // 带 hash 的静态资源长期缓存，入口与配置不缓存（发布新版本即时生效）。
      headers["Cache-Control"] = /\.[0-9a-f]{8}\.(js|css)$/.test(file) ? "public, max-age=31536000, immutable" : "no-cache";
      res.writeHead(200, headers);
      if (req.method === "HEAD") { res.end(); return; }
      fs.createReadStream(file).pipe(res);
    });
  });
}

http.createServer((req, res) => {
  if (req.url.startsWith("/xy-video/webrtc/")) return proxy(req, res, upstream.webrtc, "/xy-video/webrtc");
  if (req.url.startsWith("/xy-video/hls/")) return proxy(req, res, upstream.hls, "/xy-video/hls");
  return serveStatic(req, res);
}).listen(port, "0.0.0.0", () => console.log(`[xy-server] http://0.0.0.0:${port}  root=${root}  webrtc=${upstream.webrtc}  hls=${upstream.hls}`));
