# XY 监控测试视频流

1. 下载 MediaMTX（https://github.com/bluenviron/mediamtx/releases ，windows_amd64），放到本目录。13 路监控统一拉取现场源 rtsp://admin:***@10.67.15.2:554（见 xy-cameras.yml，按需拉流），无需 ffmpeg。
2. 双击 start-xy-cameras.bat。
3. RTSP：rtsp://<本机IP>:8554/cam1 … cam13；页面经 WebRTC（8889）播放。
4. 接真实摄像头：在 xy-cameras.yml 中为 camN 配置 source: rtsp://...；网关地址可在 public/config.json 的 cases.xy.video.host 覆盖。
