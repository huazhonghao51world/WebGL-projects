#!/usr/bin/env bash
# 新耀工厂数字孪生 · 国产化一体机部署管理脚本（银河麒麟 V10 / 统信 UOS，x86_64 / aarch64）
#
# 本目录是 GitHub 仓库 WebGL-projects 的 deploy-kylin 分支（只含构建好的程序，不含源码与数据）。
# 开发电脑修好 BUG → 构建 → 推送到 deploy-kylin；本机执行 `bash xy.sh upgrade` 即拉取替换（自动备份、失败自动回退）。
#
# 常用：
#   bash xy.sh install                首次安装（解压运行时、开机自启、防火墙、启动）
#   bash xy.sh start|stop|restart [组件]   组件：platform studio dengta video panel（不写 = 全部）
#   bash xy.sh status                 状态与访问地址
#   bash xy.sh upgrade [--yes] [desktop]  从 GitHub 拉取最新版本（desktop = 用桌面上的离线更新包）；先备份数据，失败自动回退
#   bash xy.sh rollback [版本号]       回退到上一个（或指定）程序版本，数据不动
#   bash xy.sh versions               本机可回退的版本列表
#   bash xy.sh import-data [目录]      导入数据包（不写目录 = 自动找桌面上向日葵传来的 xy-data-日期 文件夹）
#   bash xy.sh backup | restore <目录> 在线热备份 / 恢复平台数据
#   bash xy.sh doctor                 一键体检，生成诊断报告（发给开发排查）
#   bash xy.sh browser [参数]          全屏打开新耀工厂大屏（如 gpu=compact）
#   bash xy.sh logs [服务名]           查看日志
set -euo pipefail
ROOT="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
cd "$ROOT"
APP="$ROOT/app"; LOCAL="$ROOT/local"; LOGS="$ROOT/logs"; RUN="$ROOT/run"; BACKUPS="$ROOT/backups"
mkdir -p "$LOCAL" "$LOGS" "$RUN" "$BACKUPS"
# 本机配置（端口、密码、大模型等），不随程序更新覆盖
# shellcheck source=/dev/null
[ -f "$LOCAL/xy.env" ] && . "$LOCAL/xy.env"
DATA="${TWIN_DATA_DIR:-$ROOT/data}"
BRANCH="${XY_DEPLOY_BRANCH:-deploy-kylin}"
BACKUP_KEEP="${BACKUP_KEEP:-7}"

case "$(uname -m)" in x86_64|amd64) ARCH=x64 ;; aarch64|arm64) ARCH=arm64 ;; *) echo "不支持的 CPU 架构：$(uname -m)"; exit 1 ;; esac
NODE="$ROOT/runtime/node/bin/node"; MTX="$ROOT/runtime/mediamtx/mediamtx"; FFMPEG="$ROOT/runtime/bin/ffmpeg"

PORT_API="${PORT_API:-5184}"; PORT_DEMO="${PORT_DEMO:-5185}"; PORT_EDITOR="${PORT_EDITOR:-5186}"; PORT_DEBUG="${PORT_DEBUG:-5188}"
PORT_DENGTA="${PORT_DENGTA:-3716}"; PORT_PANEL="${PORT_PANEL:-5099}"; PORT_MTX_WEBRTC="${PORT_MTX_WEBRTC:-8889}"; PORT_MTX_HLS="${PORT_MTX_HLS:-8888}"

c_ok() { printf '\033[32m%s\033[0m\n' "$*"; }; c_warn() { printf '\033[33m%s\033[0m\n' "$*"; }; c_err() { printf '\033[31m%s\033[0m\n' "$*"; }
ip_addr() { local ip; ip="$(hostname -I 2>/dev/null | awk '{print $1}')"; echo "${ip:-127.0.0.1}"; }
version() { [ -f "$ROOT/VERSION" ] && head -n 1 "$ROOT/VERSION" || echo "未知"; }
sudo_cmd() { if [ "$(id -u)" = 0 ]; then "$@"; else sudo "$@"; fi; }

# ---------------------------------------------------------------- 运行时（Node / MediaMTX / ffmpeg，随仓库提供）
unpack_runtime() {
  local stamp; stamp="$ARCH:$(cat "packages/$ARCH.sha256" 2>/dev/null | sha256sum | cut -c1-16)"
  if [ -x "$NODE" ] && [ -x "$MTX" ] && [ -x "$FFMPEG" ] && [ "$(cat runtime/.stamp 2>/dev/null)" = "$stamp" ]; then return 0; fi
  [ -f "packages/node-$ARCH.tar.xz" ] || { c_err "缺少运行时 packages/node-$ARCH.tar.xz（本机 CPU 架构 $ARCH）"; exit 1; }
  echo "· 解压运行时（$ARCH）"
  rm -rf runtime; mkdir -p runtime/node runtime/mediamtx runtime/bin
  tar -xJf "packages/node-$ARCH.tar.xz" -C runtime/node --strip-components=1
  tar -xzf "packages/mediamtx-$ARCH.tar.gz" -C runtime/mediamtx
  gzip -dc "packages/ffmpeg-$ARCH.gz" > "$FFMPEG"
  chmod +x "$NODE" "$MTX" "$FFMPEG"
  echo "$stamp" > runtime/.stamp
}

# ---------------------------------------------------------------- 进程管理
pid_of() { local f="$RUN/$1.pid"; [ -f "$f" ] && kill -0 "$(cat "$f")" 2>/dev/null && cat "$f" || true; }
launch() { # 名称 命令...
  local name="$1"; shift
  if [ -n "$(pid_of "$name")" ]; then echo "  · $name 已在运行"; return; fi
  # setsid：脱离终端会话（关闭终端后服务继续运行），进程组号 = pid，停止时整组结束（含 ffmpeg 等子进程）
  setsid nohup "$@" >>"$LOGS/$name.log" 2>&1 < /dev/null &
  echo $! > "$RUN/$name.pid"
  echo "  ✓ $name (pid $!)"
}
halt() { # 名称：先 TERM 让服务优雅退出（数据库落盘），10 秒后仍在则强制结束
  local name="$1" pid; pid="$(pid_of "$name")"
  if [ -n "$pid" ]; then
    kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
    for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.5; done
    kill -9 -- "-$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
    echo "  ■ $name"
  fi
  rm -f "$RUN/$name.pid"
}
wait_http() { # URL 秒数 说明
  local i; for i in $(seq 1 "${2:-60}"); do
    curl -fs -o /dev/null --max-time 2 "$1" && return 0
    [ $((i % 15)) = 0 ] && echo "    …仍在等待 ${3:-$1}（${i} 秒）"
    sleep 1
  done
  c_err "  ✗ 等待超时：$1"; return 1
}

SERVICES_platform="platform-api platform-worker"
SERVICES_studio="studio-editor studio-debug studio-demo"
SERVICES_dengta="dengta"
SERVICES_video="video-gateway"
SERVICES_panel="panel"
ALL_COMPONENTS="platform studio video dengta panel"
services_of() { local c; for c in "$@"; do eval "echo \${SERVICES_$c:-}"; done; }
components() {
  if [ $# -eq 0 ]; then echo "$ALL_COMPONENTS"; return; fi
  local c; for c in "$@"; do case "$c" in platform|studio|dengta|video|panel) echo "$c" ;; *) c_err "未知组件：$c（可选 platform studio dengta video panel）"; exit 1 ;; esac; done
}

start_platform() {
  [ -f "$DATA/platform.sqlite" ] || { c_err "  ✗ 数据目录缺失：$DATA（请先把数据包传到桌面，再执行 bash xy.sh import-data）"; return 1; }
  # API 对外监听：交付接口（交付码 + Bearer）可被大屏直接调用；登录类接口只接受本机回环（经各站点同源代理访问）。
  TWIN_DATA_DIR="$DATA" TWIN_API_HOST=0.0.0.0 TWIN_API_PORT="$PORT_API" \
    TWIN_DEMO_PORT="$PORT_DEMO" TWIN_EDITOR_PORT="$PORT_EDITOR" TWIN_DEBUG_PORT="$PORT_DEBUG" \
    launch platform-api "$NODE" --max-old-space-size=3072 "$APP/platform/api/server.js"
  # 首次启动（或刚导入数据、机械硬盘）需要读取并校验全部数据，可能要 1–3 分钟
  wait_http "http://127.0.0.1:$PORT_API/api/health" 300 "平台 API 启动（首次较慢）"
  TWIN_DATA_DIR="$DATA" launch platform-worker "$NODE" --max-old-space-size=4096 "$APP/platform/api/worker.js"
}
site() { # 名称 目录 端口
  launch "$1" "$NODE" "$APP/bin/site-server.js" --root "$APP/platform/$2" --port "$3" --spa \
    --proxy "/api=127.0.0.1:$PORT_API" --local /api --local-origin "$3"
}
start_studio() {
  site studio-editor editor "$PORT_EDITOR"
  site studio-debug debug "$PORT_DEBUG"
  site studio-demo demo "$PORT_DEMO"
}
start_video() {
  local cfg="$LOCAL/xy-cameras.yml"
  [ -f "$cfg" ] || { c_warn "  · 未配置摄像头（local/xy-cameras.yml），跳过视频网关"; return 0; }
  ( cd "$LOCAL" && PATH="$ROOT/runtime/bin:$PATH" launch video-gateway "$MTX" "$cfg" )
}
start_dengta() {
  # 现场配置 local/dengta-config.json 优先（不存在时使用程序自带 config.json）
  launch dengta "$NODE" "$APP/bin/site-server.js" --root "$APP/dengta" --port "$PORT_DENGTA" \
    --file "/config.json=$LOCAL/dengta-config.json" \
    --proxy "/api=127.0.0.1:$PORT_API" --local /api --local-origin "$PORT_DEMO" \
    --proxy "/xy-video/webrtc=127.0.0.1:$PORT_MTX_WEBRTC" --strip /xy-video/webrtc \
    --proxy "/xy-video/hls=127.0.0.1:$PORT_MTX_HLS" --strip /xy-video/hls
  wait_http "http://127.0.0.1:$PORT_DENGTA/" 30
}
start_panel() {
  PANEL_PORT="$PORT_PANEL" PANEL_HOST="${PANEL_HOST:-127.0.0.1}" PANEL_CONFIG="$APP/service-panel/services.kylin.json" XY_ROOT="$ROOT" \
    launch panel "$NODE" "$APP/service-panel/server.js"
}

start() {
  unpack_runtime
  echo "启动（版本 $(version)）："
  local c; for c in $(components "$@"); do "start_$c"; done
  status_brief
}
stop() {
  local list c s; list=" $(components "$@" | tr '\n' ' ') "
  # 停止顺序与启动相反：先停前台，最后停平台
  for c in panel dengta video studio platform; do
    case "$list" in *" $c "*) for s in $(services_of "$c"); do halt "$s"; done ;; esac
  done
  case "$list" in *" video "*) pkill -f "$ROOT/runtime/bin/ffmpeg" 2>/dev/null || true ;; esac
}

status_brief() {
  local ip; ip="$(ip_addr)"
  echo; echo "服务状态（版本 $(version)）："
  local c s
  for c in $ALL_COMPONENTS; do for s in $(services_of "$c"); do
    if [ -n "$(pid_of "$s")" ]; then printf "  %-16s \033[32m运行中\033[0m (pid %s)\n" "$s" "$(pid_of "$s")"; else printf "  %-16s \033[31m未运行\033[0m\n" "$s"; fi
  done; done
  cat <<EOF

访问地址（机器换 IP 后用新 IP 访问即可，无需改配置）：
  新耀工厂大屏        http://$ip:$PORT_DENGTA/#/xy-factory
  TwinStudio 编辑器   http://$ip:$PORT_EDITOR
  API 联调台          http://$ip:$PORT_DEBUG
  平台演示站          http://$ip:$PORT_DEMO
  平台健康检查        http://$ip:$PORT_API/api/health
  服务控制面板        http://127.0.0.1:$PORT_PANEL   （仅本机）
EOF
}
health() { # 核心服务全部可访问 → 0
  local ok=0
  curl -fs -o /dev/null --max-time 3 "http://127.0.0.1:$PORT_API/api/health" || { c_err "  ✗ 平台 API 无响应"; ok=1; }
  curl -fs -o /dev/null --max-time 3 "http://127.0.0.1:$PORT_DENGTA/" || { c_err "  ✗ 大屏无响应"; ok=1; }
  curl -fs -o /dev/null --max-time 3 "http://127.0.0.1:$PORT_EDITOR/" || { c_err "  ✗ 编辑器无响应"; ok=1; }
  curl -fs --max-time 5 "http://127.0.0.1:$PORT_DENGTA/api/health" | grep -q '"ok":true' || { c_err "  ✗ 大屏到平台的代理不通"; ok=1; }
  return $ok
}

# ---------------------------------------------------------------- 数据
backup() {
  unpack_runtime
  local dst="${1:-$BACKUPS/data-$(date +%Y%m%d-%H%M%S)}"
  [ -f "$DATA/platform.sqlite" ] || { c_warn "无数据可备份：$DATA"; return 0; }
  echo "在线备份 $DATA → $dst"
  "$NODE" "$APP/bin/snapshot-data.mjs" "$DATA" "$dst" | tail -n 3
  # 只保留最近 BACKUP_KEEP 份自动备份
  ls -1dt "$BACKUPS"/data-* 2>/dev/null | tail -n +"$((BACKUP_KEEP + 1))" | xargs -r rm -rf
}
restore() {
  local src="${1:?用法：bash xy.sh restore <备份目录>}"
  [ -f "$src/platform.sqlite" ] || { c_err "不是有效备份：$src"; exit 1; }
  src="$(readlink -f "$src")"
  stop
  [ -d "$DATA" ] && mv "$DATA" "$DATA.before-restore-$(date +%Y%m%d-%H%M%S)"
  cp -a "$src" "$DATA"
  c_ok "已恢复（原数据已改名保留在 $(dirname "$DATA")）"; start
}
desktop_dirs() { # 桌面目录（向日葵等远程工具默认把文件传到这里）
  local d; d="$(xdg-user-dir DESKTOP 2>/dev/null || true)"
  for x in "$d" "$HOME/桌面" "$HOME/Desktop"; do [ -n "$x" ] && [ -d "$x" ] && echo "$x"; done | awk '!seen[$0]++'
}
find_on_desktop() { # 通配名 → 桌面上最新的一个（也查找桌面下一层子目录）
  local pattern="$1" d
  for d in $(desktop_dirs); do find "$d" -maxdepth 2 -name "$pattern" -printf '%T@ %p\n' 2>/dev/null; done | sort -rn | head -n 1 | cut -d' ' -f2-
}
import_data() {
  local src="${1:-}"
  if [ -z "$src" ]; then
    src="$(dirname "$(find_on_desktop 'xy-data.sha256')" 2>/dev/null)"
    [ -n "$src" ] && [ "$src" != "." ] || { c_err "桌面上没找到数据包（xy-data-日期 文件夹，里面有 xy-data.sha256）。请先用向日葵把整个文件夹传到桌面，或指定路径：bash xy.sh import-data <目录>"; exit 1; }
    echo "· 找到桌面上的数据包：$src"
  fi
  src="$(readlink -f "$src")"
  [ -f "$src/xy-data.sha256" ] || { c_err "目录中没有 xy-data.sha256：$src（请指定 xy-data-日期 目录）"; exit 1; }
  echo "· 校验数据包（约 1–3 分钟）"
  ( cd "$src" && sha256sum -c --quiet xy-data.sha256 ) || { c_err "数据包校验失败：文件损坏或没传完整，请重新传输（向日葵传完后再执行）"; exit 1; }
  unpack_runtime
  stop
  [ -d "$DATA" ] && { mv "$DATA" "$DATA.before-import-$(date +%Y%m%d-%H%M%S)"; echo "· 原数据已改名保留"; }
  mkdir -p "$DATA"
  echo "· 解压数据（约 3 GB）"
  cat "$src"/xy-data.tar.gz.part-* | tar -xzf - -C "$DATA"
  # 现场配置（摄像头、大屏配置）：本机没有时才导入，不覆盖现场修改
  if [ -d "$DATA/_site" ]; then
    for f in "$DATA"/_site/*; do [ -e "$f" ] || continue; [ -e "$LOCAL/$(basename "$f")" ] || cp -a "$f" "$LOCAL/"; done
    rm -rf "$DATA/_site"
  fi
  "$NODE" -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(process.argv[1],{readOnly:true});console.log('· 数据库完整性：',Object.values(d.prepare('PRAGMA integrity_check').get())[0]);" "$DATA/platform.sqlite"
  c_ok "数据导入完成：$DATA"
}

# ---------------------------------------------------------------- 程序版本（git）
git_ok() {
  command -v git >/dev/null || { c_err "未安装 git：sudo apt install git"; exit 1; }
  [ -d "$ROOT/.git" ] || { c_err "本目录不是 git 仓库，无法在线更新（请按手册用 git clone 部署）"; exit 1; }
}
fix_modes() { chmod +x "$ROOT"/*.sh 2>/dev/null || true; }
fetch() { # [离线更新包 .bundle | desktop]
  local b="${1:-}"
  if [ "$b" = desktop ]; then
    b="$(find_on_desktop 'xy-kylin-*.bundle')"
    [ -n "$b" ] || { c_err "桌面上没找到离线更新包（xy-kylin-日期.bundle），请先用向日葵传到桌面"; return 1; }
    echo "· 使用桌面上的离线更新包：$(basename "$b")"
  fi
  if [ -n "$b" ]; then git fetch -q "$(readlink -f "$b")" "$BRANCH"; else git fetch -q origin "$BRANCH"; fi
}
check() {
  git_ok; fetch "${1:-}" || { c_err "无法获取更新（网络 / 令牌问题，见手册：bash xy.sh set-token <令牌>）"; exit 1; }
  local n; n="$(git rev-list --count HEAD..FETCH_HEAD)"
  echo "当前版本：$(version)"
  if [ "$n" = 0 ]; then c_ok "已是最新版本"; return 0; fi
  c_warn "有 $n 个新版本："
  git log --format='  %ad  %s' --date=format:'%m-%d %H:%M' HEAD..FETCH_HEAD
  return 10
}
upgrade() {
  local yes=0 bundle="" a; for a in "$@"; do case "$a" in --yes|-y) yes=1 ;; *) bundle="$a" ;; esac; done
  git_ok
  echo "== 检查更新 =="
  local rc=0; check "$bundle" || rc=$?
  [ $rc = 10 ] || return $rc
  if [ $yes = 0 ]; then read -r -p "确认更新？更新期间大屏约中断 1 分钟 [y/N] " ans; case "$ans" in y|Y) ;; *) echo "已取消"; return 0 ;; esac; fi
  local prev; prev="$(git rev-parse HEAD)"
  echo "== 1/4 备份数据（不停机） =="
  backup "$BACKUPS/data-before-upgrade-$(date +%Y%m%d-%H%M%S)"
  echo "$(date '+%F %T') $prev $(version)" >> "$RUN/versions.log"
  echo "== 2/4 停止服务 =="
  stop
  echo "== 3/4 替换程序 =="
  git reset -q --hard FETCH_HEAD; fix_modes
  c_ok "  → $(version)"
  echo "== 4/4 启动并自检 =="
  # 新版本的 xy.sh 可能已变化：用新脚本启动
  if bash "$ROOT/xy.sh" start && sleep 3 && health; then
    c_ok "更新成功：$(version)"
  else
    c_err "新版本自检失败，自动回退到上一版本"
    bash "$ROOT/xy.sh" stop || true; git reset -q --hard "$prev"; fix_modes; bash "$ROOT/xy.sh" start
    c_warn "已回退到 $(version)。请执行 bash xy.sh doctor 并把报告发给开发人员。"
    return 1
  fi
}
rollback() {
  git_ok
  local target="${1:-}"
  if [ -z "$target" ]; then target="$(tail -n 1 "$RUN/versions.log" 2>/dev/null | awk '{print $3}')"; fi
  [ -n "$target" ] || { c_err "没有可回退的记录，请指定版本号（bash xy.sh versions 查看）"; exit 1; }
  git cat-file -e "$target^{commit}" 2>/dev/null || { c_err "找不到版本：$target"; exit 1; }
  echo "回退程序到 $(git log -1 --format='%h %s' "$target")（数据不变）"
  echo "$(date '+%F %T') $(git rev-parse HEAD) $(version)" >> "$RUN/versions.log"
  stop; git reset -q --hard "$target"; fix_modes; bash "$ROOT/xy.sh" start
}
versions() {
  git_ok
  echo "当前：$(git log -1 --format='%h  %ad  %s' --date=format:'%F %H:%M')"
  echo; echo "本机可回退的版本（bash xy.sh rollback <版本号>）："
  git log -n 15 --format='  %h  %ad  %s' --date=format:'%F %H:%M'
}
set_token() {
  git_ok
  local token="${1:?用法：bash xy.sh set-token <GitHub 只读令牌>}"
  local url; url="$(git remote get-url origin | sed -E 's#https://[^@]*@#https://#')"
  git remote set-url origin "$(echo "$url" | sed "s#https://#https://x-access-token:$token@#")"
  if git ls-remote -q origin "$BRANCH" >/dev/null; then c_ok "令牌已更新，可以访问 GitHub"; else c_err "令牌无效或网络不通"; fi
}

# ---------------------------------------------------------------- 安装 / 诊断 / 浏览器
install() {
  echo "== 新耀工厂数字孪生 · 安装（$(version)） =="
  local miss="" t; for t in curl tar xz gzip setsid ss git sha256sum; do command -v "$t" >/dev/null || miss="$miss $t"; done
  [ -z "$miss" ] || { c_err "缺少系统工具：$miss（sudo apt install curl xz-utils iproute2 git）"; exit 1; }
  fix_modes; unpack_runtime
  "$NODE" -e 'require("node:sqlite")' 2>/dev/null || { c_err "Node 运行时异常（glibc 版本过低？执行 ldd --version 查看，需 ≥ 2.28）"; exit 1; }
  [ -f "$LOCAL/xy.env" ] || cp "$ROOT/xy.env.example" "$LOCAL/xy.env"
  [ -f "$DATA/platform.sqlite" ] || { c_err "还没有数据。请先用向日葵把数据包文件夹（xy-data-日期）传到桌面，再执行：bash xy.sh import-data"; exit 1; }
  if command -v systemctl >/dev/null; then
    local unit=/etc/systemd/system/xy-twin.service
    if printf '%s\n' "[Unit]" "Description=XY Twin Suite (TwinStudio + XY dashboard + video gateway + panel)" \
      "After=network-online.target" "Wants=network-online.target" "[Service]" "Type=forking" "User=$(id -un)" \
      "WorkingDirectory=$ROOT" "ExecStart=/bin/bash $ROOT/xy.sh start" "ExecStop=/bin/bash $ROOT/xy.sh stop" \
      "RemainAfterExit=yes" "TimeoutStartSec=240" "[Install]" "WantedBy=multi-user.target" | sudo_cmd tee "$unit" >/dev/null \
      && sudo_cmd systemctl daemon-reload && sudo_cmd systemctl enable xy-twin.service >/dev/null 2>&1; then
      c_ok "  ✓ 已注册开机自启 xy-twin.service"
    else c_warn "  （未注册开机自启：需要 sudo 密码）"; fi
  fi
  if command -v firewall-cmd >/dev/null && firewall-cmd --state >/dev/null 2>&1; then
    for t in "$PORT_DENGTA" "$PORT_EDITOR" "$PORT_DEBUG" "$PORT_DEMO" "$PORT_API"; do sudo_cmd firewall-cmd -q --permanent --add-port="$t/tcp" || true; done
    sudo_cmd firewall-cmd -q --permanent --add-port=8189/udp || true; sudo_cmd firewall-cmd -q --permanent --add-port=8189/tcp || true; sudo_cmd firewall-cmd -q --reload || true
  elif command -v ufw >/dev/null && sudo_cmd ufw status 2>/dev/null | grep -q active; then
    for t in "$PORT_DENGTA" "$PORT_EDITOR" "$PORT_DEBUG" "$PORT_DEMO" "$PORT_API" 8189; do sudo_cmd ufw allow "$t" >/dev/null || true; done
  fi
  start
  touch "$RUN/.installed"
}
doctor() {
  local out; out="$LOGS/doctor-$(date +%Y%m%d-%H%M%S).txt"
  {
    echo "=== 新耀工厂体检报告 $(date '+%F %T') ==="
    echo "版本：$(version)"; [ -d .git ] && git log -1 --format='提交：%h %ad %s' --date=iso
    echo "主机：$(hostname)  IP：$(hostname -I 2>/dev/null)"
    echo "系统：$(grep -E '^(NAME|VERSION)=' /etc/os-release 2>/dev/null | tr '\n' ' ')  内核：$(uname -r)  架构：$(uname -m)"
    echo "glibc：$(ldd --version 2>/dev/null | head -n 1)"
    echo "CPU：$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)  核数：$(nproc)"
    echo; echo "--- 内存"; free -h
    echo; echo "--- 磁盘"; df -h "$ROOT" "$DATA" 2>/dev/null | sort -u
    echo; echo "--- 显卡"; (lspci 2>/dev/null | grep -iE 'vga|3d|display') || echo "lspci 不可用"
    (command -v glxinfo >/dev/null && glxinfo -B 2>/dev/null | grep -iE 'renderer|version|memory') || echo "（glxinfo 未安装：sudo apt install mesa-utils）"
    echo; echo "--- 服务"; status_brief
    echo; echo "--- 健康检查"; health && echo "全部正常"
    echo; echo "--- 监听端口"; ss -ltnp 2>/dev/null | grep -E ":($PORT_API|$PORT_DEMO|$PORT_EDITOR|$PORT_DEBUG|$PORT_DENGTA|$PORT_PANEL|8889|8888|8554)\b" || true
    echo; echo "--- 数据"; du -sh "$DATA" 2>/dev/null; ls -la "$DATA" 2>/dev/null | head -n 20
    echo; echo "--- 最近备份"; ls -1dt "$BACKUPS"/* 2>/dev/null | head -n 5
    echo; echo "--- 时间"; timedatectl 2>/dev/null | grep -iE 'local time|synchronized' || date
    for f in platform-api platform-worker dengta video-gateway panel; do echo; echo "--- 日志 $f（最后 40 行）"; tail -n 40 "$LOGS/$f.log" 2>/dev/null || echo "无"; done
  } > "$out" 2>&1
  sed -n '1,60p' "$out"
  echo; c_ok "完整报告：$out（发给开发人员）"
}
browser() { # [参数串]，如 gpu=compact 或 gldebug=1&bare=1
  local q="${1:-}"; local url="http://127.0.0.1:$PORT_DENGTA/${q:+?$q}#/xy-factory"
  local b=""; for c in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge-stable qaxbrowser-safe-stable; do command -v "$c" >/dev/null && { b="$c"; break; }; done
  [ -n "$b" ] || { c_err "未找到 Chromium 内核浏览器，请手动打开：$url"; return 1; }
  # --ignore-gpu-blocklist：国产显卡常在 Chromium 的 GPU 黑名单中，不加会退回 CPU 软件渲染（极卡）
  echo "用 $b 全屏打开：$url（Alt+F4 退出）"
  setsid nohup "$b" --kiosk --start-fullscreen --ignore-gpu-blocklist --enable-gpu-rasterization --no-first-run --disable-features=Translate \
    --user-data-dir="$RUN/browser-profile" "$url" >/dev/null 2>&1 &
}

case "${1:-}" in
  install) install ;;
  start) shift; start "$@" ;;
  stop) shift; stop "$@" ;;
  restart) shift; stop "$@"; start "$@" ;;
  status) status_brief; echo; if health; then c_ok "健康检查：全部正常"; fi ;;
  check) shift; rc=0; check "$@" || rc=$?; [ $rc = 0 ] || [ $rc = 10 ] ;;
  upgrade|update) shift; upgrade "$@" ;;
  rollback) rollback "${2:-}" ;;
  versions) versions ;;
  set-token) set_token "${2:-}" ;;
  import-data) import_data "${2:-}"; start ;;
  backup) backup "${2:-}" ;;
  restore) restore "${2:-}" ;;
  doctor) doctor ;;
  browser) browser "${2:-}" ;;
  logs) tail -n 200 -f "$LOGS/${2:-dengta}.log" ;;
  version) version ;;
  *) sed -n '2,19p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
