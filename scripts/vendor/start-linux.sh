#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Python 3.8+ is required. Use the Python supplied for your Linux OS/CPU architecture.'
  exit 1
fi
exec python3 launcher/server.py --port "${1:-3666}"
