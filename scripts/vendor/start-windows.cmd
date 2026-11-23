@echo off
setlocal
cd /d "%~dp0"
set "PORT=%~1"
if not defined PORT set "PORT=3666"
echo Open http://localhost:%PORT%/#/page_2/2 after the READY message.
echo Diagnostics: http://localhost:%PORT%/diagnostics.html
"%~dp0runtime\python-windows-x64\python.exe" "%~dp0launcher\server.py" --port %PORT%
pause
