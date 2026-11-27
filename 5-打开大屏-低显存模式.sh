#!/usr/bin/env bash
# 显卡显存不足（加载卡死、花屏、黑屏）时使用：贴图 512、关抗锯齿、限制阴影。
cd "$(dirname "$(readlink -f "$0")")"
bash xy.sh browser "gpu=compact"