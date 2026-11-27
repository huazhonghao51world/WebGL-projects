@echo off
rem XY 监控演示源：开源工厂视频循环推流 rtsp://本机:8554/cam1..cam13
cd /d "%~dp0"
set PATH=%~dp0;%PATH%
mediamtx.exe xy-cameras.demo.yml
