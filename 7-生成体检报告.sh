#!/usr/bin/env bash
# 出现问题时运行，把生成的报告文件发给开发人员。
cd "$(dirname "$(readlink -f "$0")")"
bash xy.sh doctor
echo; read -r -p "按回车关闭窗口" _