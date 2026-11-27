#!/usr/bin/env bash
cd "$(dirname "$(readlink -f "$0")")"
bash xy.sh stop
echo; read -r -p "已停止。按回车关闭窗口" _