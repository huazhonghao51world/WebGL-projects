@echo off
rem XY 工厂监控测试流：RTSP rtsp://本机:8554/cam1..cam13，页面通过 WebRTC http://本机:8889/camN/whep 播放。
cd /d "%~dp0"
set PATH=%~dp0;%PATH%
mediamtx.exe xy-cameras.yml
