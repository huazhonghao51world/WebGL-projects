#!/usr/bin/env bash
# 从 GitHub 拉取最新程序版本：自动备份数据 → 替换程序 → 启动自检，失败自动回退。
cd "$(dirname "$(readlink -f "$0")")"
bash xy.sh upgrade
echo; read -r -p "按回车关闭窗口" _