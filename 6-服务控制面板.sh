#!/usr/bin/env bash
cd "$(dirname "$(readlink -f "$0")")"
. local/xy.env 2>/dev/null || true
url="http://127.0.0.1:${PORT_PANEL:-5099}"
curl -fs -o /dev/null --max-time 2 "$url/api/status" || bash xy.sh start panel
for b in google-chrome chromium chromium-browser microsoft-edge-stable qaxbrowser-safe-stable xdg-open; do command -v "$b" >/dev/null && { setsid nohup "$b" "$url" >/dev/null 2>&1 & break; }; done