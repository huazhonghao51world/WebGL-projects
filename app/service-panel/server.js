// 本机服务控制面板：查看运行状态 / IP / 端口，一键启动、停止、重启。零依赖，Node ≥ 18；Windows 与 Linux（麒麟 / UOS）通用。
// 用法：Windows 双击 start-panel.bat；Linux 执行 node server.js，然后打开 http://127.0.0.1:5099
// 配置：默认读取同目录 services.json（可从 services.example.json 复制后按本机路径修改）；环境变量 PANEL_CONFIG 可指定其他文件（部署机使用 services.kylin.json）。
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, execFile } = require('node:child_process');

const ROOT = __dirname;
const WIN = process.platform === 'win32';
const CONFIG_FILE = path.resolve(ROOT, process.env.PANEL_CONFIG || 'services.json');
const LOG_DIR = path.join(ROOT, 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8').replace(/^\uFEFF/, ''));
const PORT = Number(process.env.PANEL_PORT || loadConfig().panelPort || 5099);
// 默认只监听本机；PANEL_HOST=0.0.0.0 时局域网可访问（仅在可信内网使用）。
const HOST = process.env.PANEL_HOST || loadConfig().panelHost || '127.0.0.1';
const busy = new Map(); // service id → 'starting' | 'stopping'
// 相对路径的 cwd 以配置文件所在目录为基准（部署包整体搬迁后无需改配置）。
const cwdOf = (svc) => path.resolve(path.dirname(CONFIG_FILE), svc.cwd || '.');

const run = (file, args) => new Promise((resolve) => {
  // LC_ALL=C：ps 的启动时间等字段固定为英文格式（麒麟默认中文 locale）。
  execFile(file, args, { windowsHide: true, maxBuffer: 64 * 1024 * 1024, env: WIN ? process.env : { ...process.env, LC_ALL: 'C' } }, (error, stdout) => resolve(error && !stdout ? '' : stdout));
});

async function snapshotWindows() {
  const [procJson, netstat] = await Promise.all([
    run('powershell.exe', ['-NoProfile', '-Command', '[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine,CreationDate | ConvertTo-Json -Compress']),
    run('netstat.exe', ['-ano', '-p', 'TCP']),
  ]);
  let list = [];
  try { list = JSON.parse(procJson || '[]'); } catch { list = []; }
  const procs = new Map(list.map((p) => [p.ProcessId, { pid: p.ProcessId, ppid: p.ParentProcessId, name: String(p.Name || '').toLowerCase().replace(/\.exe$/, ''), cmd: p.CommandLine || '', created: p.CreationDate }]));
  const listen = new Map(); // pid → Set(port)
  for (const line of netstat.split(/\r?\n/)) {
    const m = line.trim().match(/^TCP\s+(\S+):(\d+)\s+\S+\s+LISTENING\s+(\d+)$/i);
    if (!m) continue;
    const pid = Number(m[3]);
    if (!listen.has(pid)) listen.set(pid, new Set());
    listen.get(pid).add(Number(m[2]));
  }
  return { procs, listen };
}

async function snapshotLinux() {
  const [ps, ss] = await Promise.all([
    run('ps', ['-eo', 'pid=,ppid=,lstart=,comm=,args=', '-ww']),
    run('ss', ['-ltnpH']),
  ]);
  const procs = new Map();
  for (const line of ps.split('\n')) {
    // lstart 固定 5 段：Thu Nov 27 10:00:00 2026
    const m = line.trim().match(/^(\d+)\s+(\d+)\s+(\S+\s+\S+\s+\d+\s+[\d:]+\s+\d+)\s+(\S+)\s+(.*)$/);
    if (!m) continue;
    const pid = Number(m[1]);
    procs.set(pid, { pid, ppid: Number(m[2]), name: m[4].toLowerCase(), cmd: m[5], created: new Date(m[3]).toISOString() });
  }
  const listen = new Map();
  for (const line of ss.split('\n')) {
    const port = (line.match(/\s\S*:(\d+)\s+\S+:\S+\s/) || [])[1];
    if (!port) continue;
    for (const [, pid] of line.matchAll(/pid=(\d+)/g)) {
      if (!listen.has(Number(pid))) listen.set(Number(pid), new Set());
      listen.get(Number(pid)).add(Number(port));
    }
  }
  return { procs, listen };
}
const snapshot = WIN ? snapshotWindows : snapshotLinux;
const SHELL = /^(cmd|sh|bash|dash)$/;
const NODE = /^(node|nodejs|mediamtx)$/;

/** 从匹配进程向上找到同一服务的根进程（npm / npx / shell 包装层），不越过面板自身、终端或无关 node 进程 */
function rootOf(pid, procs, re) {
  const climbable = (p) => {
    if (p.pid === process.pid || p.pid === 1 || /service-panel/i.test(p.cmd)) return false;
    if (p.name === 'cmd') return /npm|npx|node|vue-cli|vite/i.test(p.cmd);
    if (SHELL.test(p.name)) return re.test(p.cmd) || /npm|npx|vue-cli|vite/i.test(p.cmd);
    if (NODE.test(p.name)) return re.test(p.cmd) || /npm-cli\.js|npx-cli\.js|scripts[\\/]dev\.mjs/i.test(p.cmd);
    return false;
  };
  let current = procs.get(pid);
  while (current) {
    const parent = procs.get(current.ppid);
    if (!parent || !climbable(parent)) break;
    current = parent;
  }
  return current ? current.pid : pid;
}

function treeOf(rootPid, procs) {
  const result = [rootPid];
  for (let i = 0; i < result.length; i++) for (const p of procs.values()) if (p.ppid === result[i] && !result.includes(p.pid)) result.push(p.pid);
  return result;
}

function lanIps() {
  const ips = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const item of list || []) if (item.family === 'IPv4' && !item.internal && !/vEthernet|VMware|VirtualBox|WSL/i.test(name)) ips.push({ name, address: item.address });
  }
  return ips;
}

async function status() {
  const config = loadConfig();
  const { procs, listen } = await snapshot();
  const services = config.services.map((svc) => {
    const re = new RegExp(svc.match, 'i');
    const roots = new Set();
    for (const p of procs.values()) if (NODE.test(p.name) && p.pid !== process.pid && re.test(p.cmd) && !/service-panel/i.test(p.cmd)) roots.add(rootOf(p.pid, procs, re));
    // 合并互相包含的进程树（同一服务的内层进程不单独计为实例）
    const trees = new Map([...roots].map((root) => [root, treeOf(root, procs)]));
    for (const [root] of trees) for (const [other, tree] of trees) if (other !== root && tree.includes(root)) { trees.delete(root); break; }
    const instances = [...trees.keys()].map((root) => {
      const tree = trees.get(root);
      const ports = [...new Set(tree.flatMap((pid) => [...(listen.get(pid) || [])]))].sort((a, b) => a - b);
      const r = procs.get(root);
      return { pid: root, processes: tree.length, ports, cmd: r ? r.cmd : '', created: r ? r.created : null };
    });
    const ports = [...new Set(instances.flatMap((i) => i.ports))].sort((a, b) => a - b);
    return {
      id: svc.id, name: svc.name, desc: svc.desc, cwd: cwdOf(svc), start: svc.start, noStart: Boolean(svc.noStart),
      expectedPorts: svc.ports || {}, links: svc.links || [], instances, ports, multi: Boolean(svc.multi),
      state: busy.get(svc.id) || (instances.length ? (ports.length ? 'running' : 'starting') : 'stopped'),
      hasLog: logFiles(svc).some((f) => fs.existsSync(f)),
    };
  });
  return { host: os.hostname(), platform: process.platform, ips: lanIps(), panelPort: PORT, services, at: Date.now() };
}

function find(id) {
  const svc = loadConfig().services.find((s) => s.id === id);
  if (!svc) throw Object.assign(new Error(`未知服务 ${id}`), { status: 404 });
  return svc;
}

/** 结束整棵进程树：Windows 用 taskkill /T；Linux 先 TERM（让服务优雅退出、SQLite 落盘），超时再 KILL。 */
async function killTree(rootPid) {
  if (WIN) { await run('taskkill.exe', ['/PID', String(rootPid), '/T', '/F']); return; }
  const { procs } = await snapshot();
  const tree = treeOf(rootPid, procs);
  for (const pid of tree.reverse()) { try { process.kill(pid, 'SIGTERM'); } catch { /* 已退出 */ } }
  for (let i = 0; i < 20 && tree.some(alive); i++) await new Promise((r) => setTimeout(r, 500));
  for (const pid of tree) if (alive(pid)) { try { process.kill(pid, 'SIGKILL'); } catch { /* 已退出 */ } }
}
function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }

async function stopService(id) {
  const svc = find(id);
  const current = (await status()).services.find((s) => s.id === id);
  if (!current || !current.instances.length) return { stopped: 0 };
  busy.set(id, 'stopping');
  try {
    if (svc.stop) await runCommand(svc, svc.stop, 'a');
    else for (const inst of current.instances) await killTree(inst.pid);
    for (let i = 0; i < 20; i++) {
      const s = (await status()).services.find((x) => x.id === id);
      if (!s.instances.length) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    return { stopped: current.instances.length };
  } finally { busy.delete(id); }
}

/** 同步执行一条命令（自定义 stop），输出追加到服务日志。 */
function runCommand(svc, command, mode) {
  const fd = fs.openSync(path.join(LOG_DIR, `${svc.id}.log`), mode);
  fs.writeSync(fd, `[${new Date().toLocaleString()}] > ${command}  (cwd ${cwdOf(svc)})\n`);
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, cwd: cwdOf(svc), windowsHide: true, stdio: ['ignore', fd, fd], env: { ...process.env, ...(svc.env || {}) } });
    child.on('exit', () => { fs.closeSync(fd); resolve(); });
    child.on('error', () => { fs.closeSync(fd); resolve(); });
  });
}

async function startService(id) {
  const svc = find(id);
  if (svc.noStart) throw Object.assign(new Error('该服务已停用，不提供启动'), { status: 400 });
  const current = (await status()).services.find((s) => s.id === id);
  if (current.instances.length) return { already: true };
  const logFile = path.join(LOG_DIR, `${id}.log`);
  const fd = fs.openSync(logFile, 'w');
  fs.writeSync(fd, `[${new Date().toLocaleString()}] > ${svc.start}  (cwd ${cwdOf(svc)})\n`);
  const child = spawn(svc.start, {
    shell: true, cwd: cwdOf(svc), detached: true, windowsHide: true, stdio: ['ignore', fd, fd],
    env: { ...process.env, ...(svc.env || {}), BROWSER: 'none', FORCE_COLOR: '0' },
  });
  child.unref();
  fs.closeSync(fd);
  busy.set(id, 'starting');
  setTimeout(() => busy.delete(id), 4000);
  return { pid: child.pid, log: logFile };
}

/** 服务日志：面板自身记录的启动日志 + services 配置中 logs 列出的日志文件（相对配置文件目录）。 */
function logFiles(svc) {
  return [path.join(LOG_DIR, `${svc.id}.log`), ...(svc.logs || []).map((f) => path.resolve(path.dirname(CONFIG_FILE), f))];
}
function tail(files, lines = 300) {
  return files.filter((f) => fs.existsSync(f)).map((file) => {
    const text = fs.readFileSync(file, 'utf8').replace(/\x1b\[[0-9;]*m/g, '');
    return `===== ${path.basename(file)} =====\n${text.split(/\r?\n/).slice(-lines).join('\n')}`;
  }).join('\n\n');
}

const send = (res, code, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'GET' && url.pathname === '/') return send(res, 200, fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), 'text/html; charset=utf-8');
    if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, await status());
    const m = url.pathname.match(/^\/api\/services\/([\w-]+)\/(start|stop|restart|log)$/);
    if (m) {
      const [, id, action] = m;
      find(id);
      if (action === 'log' && req.method === 'GET') return send(res, 200, tail(logFiles(find(id))), 'text/plain; charset=utf-8');
      if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
      if (action === 'start') return send(res, 200, await startService(id));
      if (action === 'stop') return send(res, 200, await stopService(id));
      await stopService(id);
      return send(res, 200, await startService(id));
    }
    const all = url.pathname.match(/^\/api\/all\/(start|stop)$/);
    if (all && req.method === 'POST') {
      const result = {};
      for (const svc of loadConfig().services) {
        if (all[1] === 'start' && svc.noStart) continue;
        try { result[svc.id] = all[1] === 'start' ? await startService(svc.id) : await stopService(svc.id); } catch (e) { result[svc.id] = { error: e.message }; }
      }
      return send(res, 200, result);
    }
    send(res, 404, { error: 'not found' });
  } catch (error) {
    send(res, error.status || 500, { error: error.message });
  }
}).listen(PORT, HOST, () => console.log(`服务控制面板：http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}  配置 ${CONFIG_FILE}`));
