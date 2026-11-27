# 生成新耀工厂部署机的「程序更新包」（在开发机执行，产物拷到部署机后 ./xy.sh update <包>）。
# 用法：
#   powershell -File tools\deploy\make-update.ps1 -Version 1.4.3 -Dengta            # 只更新大屏
#   powershell -File tools\deploy\make-update.ps1 -Version 1.4.3 -Dengta -Platform  # 大屏 + TwinStudio 平台程序
# 更新包只含程序，不含数据；部署机上的 data/、xy.env、大屏 config.json、摄像头配置都会保留。
param([Parameter(Mandatory)][string]$Version, [switch]$Dengta, [switch]$Platform, [switch]$Video)
$ErrorActionPreference = "Stop"
if (-not ($Dengta -or $Platform -or $Video)) { throw "至少指定 -Dengta / -Platform / -Video 之一" }
$Proj = Resolve-Path "$PSScriptRoot\..\.."
$Twin = "E:\All_in_wdp\wdpapi_sdk\threejs-twin-p0"
$Out = "E:\All_in_wdp\deploy-build\updates"
$Stage = Join-Path $env:TEMP "xy-update-$Version"
Remove-Item $Stage -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force "$Stage\xy-update", $Out | Out-Null
$U = "$Stage\xy-update"

if ($Dengta) {
  Write-Host "· 构建新耀工厂大屏"
  Push-Location $Proj
  $env:VUE_APP_OUT_DIR = "outputs\xy-release-$Version"
  npm run build | Out-Null
  if ($LASTEXITCODE) { throw "大屏构建失败" }
  Pop-Location
  Copy-Item "$Proj\outputs\xy-release-$Version" "$U\dengta" -Recurse
  # 部署机走同源代理，平台地址固定为 /api（部署机上会保留现场 config.json，这里仅作新装默认值）
  $cfg = "$U\dengta\config.json"
  $t = [IO.File]::ReadAllText($cfg) -replace '"serverUrl":\s*"[^"]*"', '"serverUrl": "/api"'
  [IO.File]::WriteAllText($cfg, $t, (New-Object Text.UTF8Encoding($false)))
}
if ($Platform) {
  Write-Host "· 构建 TwinStudio 平台"
  Push-Location $Twin
  node node_modules\typescript\bin\tsc -b; if ($LASTEXITCODE) { throw "平台编译失败" }
  foreach ($a in "editor", "debug", "demo") { Push-Location "apps\$a"; node ..\..\node_modules\vite\bin\vite.js build | Out-Null; if ($LASTEXITCODE) { throw "$a 构建失败" }; Pop-Location }
  New-Item -ItemType Directory -Force "$U\platform\api" | Out-Null
  node node_modules\esbuild\bin\esbuild services/platform/dist/server.js services/platform/dist/worker.js services/platform/dist/volume-worker.js --bundle --platform=node --format=esm --target=node22 "--outdir=$U\platform\api" --external:gltf-validator --external:meshoptimizer "--banner:js=import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" --log-level=warning
  foreach ($a in "editor", "debug", "demo") { Copy-Item "apps\$a\dist" "$U\platform\$a" -Recurse }
  Pop-Location
  Copy-Item "E:\All_in_wdp\deploy-build\xy-twin-suite\platform\api\package.json", "E:\All_in_wdp\deploy-build\xy-twin-suite\platform\api\node_modules" "$U\platform\api" -Recurse
}
if ($Video) { New-Item -ItemType Directory -Force "$U\video" | Out-Null; Copy-Item "E:\All_in_wdp\deploy-build\xy-twin-suite\video\xy-cameras.yml" "$U\video" }
New-Item -ItemType Directory -Force "$U\bin" | Out-Null
Copy-Item "$PSScriptRoot\site-server.js", "$PSScriptRoot\snapshot-data.mjs" "$U\bin"
Set-Content "$U\VERSION" "$Version $(Get-Date -Format 'yyyy-MM-dd HH:mm') $((@('dengta','platform','video') | ? { (Get-Variable -Name ($_.Substring(0,1).ToUpper()+$_.Substring(1)) -ValueOnly) }) -join '+')" -Encoding ascii

$name = "xy-update-$Version.tar.gz"
Push-Location $Stage; tar -czf "$Out\$name" xy-update; Pop-Location
Remove-Item $Stage -Recurse -Force
"{0}  {1:N1} MB" -f "$Out\$name", ((Get-Item "$Out\$name").Length / 1MB)
