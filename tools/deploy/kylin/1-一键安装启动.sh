#!/usr/bin/env bash
# 双击（选择“在终端中运行”）：首次自动安装，之后直接启动全部服务，并全屏打开大屏。
cd "$(dirname "$(readlink -f "$0")")"
if [ -f run/.installed ]; then bash xy.sh start; else bash xy.sh install; fi && bash xy.sh browser
echo; read -r -p "按回车关闭窗口（服务在后台继续运行）" _