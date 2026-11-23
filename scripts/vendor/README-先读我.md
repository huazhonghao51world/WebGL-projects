# dengta 工厂场景离线部署包

版本：2026-11-13。用途：在另一台机器运行 dengta 工厂交付页面，排查浏览器、显卡驱动与 WebGL2 兼容问题。

## Windows x64：无需安装 Node、Python 或 TwinSDK

1. 将整个压缩包解压到本机普通目录，例如 D:/dengta-gpu-test。不要在压缩软件里直接运行。
2. 双击 start-windows.cmd。启动器使用随包附带的官方 Python 3.12.10 Windows x64 便携运行时。
3. 等待终端显示 Integrity OK 和 Offline dengta ready。保持该窗口打开。
4. 在待测机器自己的浏览器输入 http://localhost:3666/#/page_2/2 。
5. 诊断页地址：http://localhost:3666/diagnostics.html ，可保存诊断 JSON。
6. 关闭服务按 Ctrl+C，再关闭终端。

若 3666 端口占用，在解压目录打开命令行执行 start-windows.cmd 3766，然后访问 http://localhost:3766/#/page_2/2 。服务会自动调整页面配置，不必手工改 config.json。

本包附带的是 Windows x64 运行时。Windows ARM64、32 位 Windows 或旧版不兼容系统不属于这项免安装承诺；不要直接替换 DLL，应使用匹配系统架构的运行时。

## 国产 Linux / ARM64 / LoongArch 等

前端和快照与 Windows 相同。启动服务仅使用 Python 标准库，需要系统有适配该系统及 CPU 架构的 Python 3.8 或以上版本，无需 pip 或 npm 安装任何包。

```sh
python3 --version
sh start-linux.sh
# 或指定端口
sh start-linux.sh 3766
```

没有 Python 时，请使用系统/厂商提供的相应架构离线安装包安装 Python 后再运行。本包不包含各国产系统的 Python 二进制；本次未在 Linux/国产 CPU 实机验收。

## 包含与不包含

- 已包含前端生产构建、TwinSDK 0.5.4、Three.js r180、当前已发布工厂快照、模型、元数据、45 项案例功能定义及功能包、本地主轴 VTK 数据。
- 无需平台、数据库、案例管理系统、Node.js、npm、公有或私有 npm 源，也无需连接我方网络。
- 通过轻量本地只读服务提供交付接口，使用 LOCAL-GPU-TEST 本地测试配置；没有生产交付码、生产 token 或平台管理权限。
- AI 对话入口在此离线构建中隐藏；真实业务后台、AI 和其他外部系统不在本次测试范围。页面实时生产指标使用现有项目的本地演示数据。
- 保留原 SDK WebGL2 初始化方式及抗锯齿/高性能偏好，不自动启用软件渲染或关闭抗锯齿。
- 默认只监听本机 127.0.0.1。应在运行服务的同一台待测机器打开浏览器，不能用另一台机器访问它的 localhost。
- 运行测试包无需公网。包内旧业务模块可能保留未执行的历史 URL 字符串；已验证入口和约定交互没有实际外部请求。

## 建议测试顺序

1. 先打开诊断页，记录两组 contextCreated 和 drawPassed，以及 renderer/vendor。
2. 打开工厂页面，确认出现真实厂房和设备模型，产线总览有数据。
3. 点击左侧 CNC-01，确认右侧设备详情更新并且相机定位。
4. 测试拖动旋转、滚轮缩放；点击底部“分析 → 主轴热仿真 · VTK”，确认温度色标、时间步及热仿真面板出现。
5. 刷新页面、关闭后重新启动再测一次。
6. 优先在物理桌面测试，再用远程桌面对照，并分别记录结果。

## 出错时提供什么

- 诊断页点击“保存诊断 JSON”。
- 浏览器控制台截图，展开原始 TwinError 的 code、message、details；离线构建也会在错误框展示底层信息。
- 控制台执行 JSON.stringify(window.__dengtaDiagnostics, null, 2)，复制结果。未创建成功前该值可能尚不存在。
- Chromium 浏览器的 chrome://gpu 页面：Graphics Feature Status、Problems Detected、Driver Information 和 Log Messages。
- 操作系统、CPU 架构、显卡型号、驱动版本、浏览器完整版本，是否远程桌面。
- 终端启动错误，以及 manifest.json 中的包版本和 sceneRevision。

若提示 START FAILED / Integrity check failed，优先重新完整解压并检查文件是否被安全软件删除。端口占用可换端口。若诊断页报告 WebGL2 创建失败，包部署正常也不能代替修复浏览器/驱动图形环境。

## 完整性与验证范围

每次启动都会核对 manifest.json 中的文件大小和 SHA-256。不要修改包内受校验文件；更改端口请用启动参数。

Windows 单独校验：

```bat
runtime\python-windows-x64\python.exe launcher\server.py --verify-only
```

Linux 单独校验：

```sh
python3 launcher/server.py --verify-only
```

validation/ 中有本机验收记录和截图。本机通过不代表目标国产显卡已通过，目标环境需使用同一包进行复测。

此包包含内部工厂案例资产与功能实现，仅用于本次兼容性测试，请按约定范围流转。
