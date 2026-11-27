# 构建并发布国产化一体机程序版本（在开发电脑执行）
#
# 产物推送到 GitHub 仓库 WebGL-projects 的 deploy-kylin 分支（只含构建好的程序 + 运行时 + 运维脚本，不含源码与数据），
# 麒麟一体机上执行 `bash xy.sh upgrade`（或双击「3-检查并更新版本.sh」）即可拉取替换。
#
# 用法（PowerShell）：
#   powershell -File tools\deploy\kylin\publish-kylin.ps1 -Note "修复注塑车间疏散路线"              # 构建大屏 + 平台并发布
#   powershell -File tools\deploy\kylin\publish-kylin.ps1 -Note "..." -Only dengta                 # 只更新大屏（最快）
#   powershell -File tools\deploy\kylin\publish-kylin.ps1 -Note "..." -NoPush                      # 只生成不推送（先自测）
#   powershell -File tools\deploy\kylin\publish-kylin.ps1 -Note "..." -Bundle                      # 另存离线更新包（一体机不能上网时，用向日葵传到桌面后 bash xy.sh upgrade desktop）
#   powershell -File tools\deploy\kylin\publish-kylin.ps1 -Note "..." -WithArm64                   # 同时带 arm64 运行时（飞腾 / 鲲鹏机器）
param(
  [Parameter(Mandatory)][string]$Note,
  [ValidateSet('all', 'dengta', 'platform', 'scripts')][string]$Only = 'all',
  [switch]$NoPush, [switch]$Bundle, [switch]$WithArm64, [switch]$SkipBuild,
  [string]$Twin = 'E:\All_in_wdp\wdpapi_sdk\threejs-twin-p0',
  [string]$Work = 'E:\All_in_wdp\deploy-build\kylin-repo',
  [string]$Runtimes = 'E:\All_in_wdp\deploy-build\dl',
  [string]$Remote = 'https://github.com/huazhonghao51world/WebGL-projects.git',
  [string]$Branch = 'deploy-kylin'
)
$ErrorActionPreference = 'Continue'   # 原生命令（git / npm / node）的 stderr 不当作异常，失败一律由 Must 按退出码判断
function G { & git @args 2>&1 | ForEach-Object { "$_" } }
$Proj = (Resolve-Path "$PSScriptRoot\..\..\..").Path
$Kylin = $PSScriptRoot
$Utf8 = New-Object Text.UTF8Encoding($false)
function Step($text) { Write-Host "`n== $text" -ForegroundColor Cyan }
function Must($what) { if ($LASTEXITCODE) { throw "$what 失败（退出码 $LASTEXITCODE）" } }
function Mirror($from, $to) {
  # robocopy /MIR：目标与源完全一致（删除多余文件），退出码 < 8 为成功
  robocopy $from $to /MIR /NJH /NJS /NFL /NDL /NP /R:2 /W:1 | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "复制失败：$from → $to" }
  $global:LASTEXITCODE = 0
}
function Rev($dir) {
  $h = (G -C $dir rev-parse --short HEAD | Select-Object -Last 1).Trim()
  if (G -C $dir status --porcelain) { $h += '-未提交' }
  $h
}

# ---------------------------------------------------------------- 0. 产物仓库（deploy-kylin 分支的独立工作目录）
Step "准备产物仓库 $Work（分支 $Branch）"
if (-not (Test-Path "$Work\.git")) {
  New-Item -ItemType Directory -Force $Work | Out-Null
  G -C $Work init -q -b $Branch | Out-Null; Must 'git init'
  G -C $Work remote add origin $Remote | Out-Null
  G -C $Work config core.autocrlf false | Out-Null
  G -C $Work config core.quotepath false | Out-Null
  G -C $Work fetch -q origin $Branch | Out-Null
  if (-not $LASTEXITCODE) { G -C $Work reset -q --hard FETCH_HEAD | Out-Null } else { $global:LASTEXITCODE = 0; Write-Host '  远端还没有该分支，将创建' }
} else {
  G -C $Work fetch -q origin $Branch | Out-Null
  if (-not $LASTEXITCODE) {
    $behind = [int](G -C $Work rev-list --count HEAD..FETCH_HEAD | Select-Object -Last 1)
    if ($behind) { G -C $Work reset -q --hard FETCH_HEAD | Out-Null; Write-Host "  已同步远端（$behind 个提交）" }
  } else { $global:LASTEXITCODE = 0 }
}
$App = "$Work\app"

# ---------------------------------------------------------------- 1. 新耀工厂大屏
if ($Only -in 'all', 'dengta') {
  if (-not $SkipBuild) {
    Step '构建新耀工厂大屏（dengta-twinProject）'
    Push-Location $Proj; npm run build 2>&1 | Select-String 'DONE|ERROR|error ' | ForEach-Object { "  $_" }; Must '大屏构建'; Pop-Location
  }
  Mirror "$Proj\dist" "$App\dengta"
  # 一体机走同源代理：平台地址固定为 /api（现场如需改交付码等，写在一体机 local/dengta-config.json，不会被更新覆盖）
  $cfg = "$App\dengta\config.json"
  $t = [IO.File]::ReadAllText($cfg) -replace '"serverUrl":\s*"[^"]*"', '"serverUrl": "/api"'
  [IO.File]::WriteAllText($cfg, $t, $Utf8)
}

# ---------------------------------------------------------------- 2. TwinStudio 平台（API + 编辑器 / 联调台 / 演示站）
if ($Only -in 'all', 'platform') {
  Push-Location $Twin
  if (-not $SkipBuild) {
    Step '构建 TwinStudio 平台（threejs-twin-p0）'
    node node_modules\typescript\bin\tsc -b; Must '平台编译'
    foreach ($a in 'editor', 'debug', 'demo') {
      Push-Location "apps\$a"; node ..\..\node_modules\vite\bin\vite.js build --logLevel error; Must "$a 构建"; Pop-Location
    }
  }
  $api = "$App\platform\api"
  New-Item -ItemType Directory -Force $api | Out-Null
  Get-ChildItem $api -File -Filter *.js | Remove-Item
  # 打包为单文件（运行时零 npm 依赖）；gltf-validator / meshoptimizer 含 wasm，随附 node_modules
  node node_modules\esbuild\bin\esbuild services/platform/dist/server.js services/platform/dist/worker.js services/platform/dist/volume-worker.js `
    --bundle --platform=node --format=esm --target=node22 "--outdir=$api" --external:gltf-validator --external:meshoptimizer `
    "--banner:js=import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" --log-level=warning
  Must 'API 打包'
  foreach ($m in 'gltf-validator', 'meshoptimizer') { Mirror "node_modules\$m" "$api\node_modules\$m" }
  [IO.File]::WriteAllText("$api\package.json", '{"name":"twin-platform-api","private":true,"type":"module","dependencies":{"gltf-validator":"2.0.0-dev.3.10","meshoptimizer":"0.22.0"}}', $Utf8)
  foreach ($a in 'editor', 'debug', 'demo') { Mirror "apps\$a\dist" "$App\platform\$a" }
  Pop-Location
}

# ---------------------------------------------------------------- 3. 脚本、控制面板、运行时、手册
Step '同步运维脚本 / 控制面板 / 运行时'
New-Item -ItemType Directory -Force "$App\bin", "$App\service-panel", "$Work\packages", "$Work\docs" | Out-Null
Copy-Item "$Proj\tools\deploy\site-server.js", "$Proj\tools\deploy\snapshot-data.mjs" "$App\bin" -Force
foreach ($f in 'server.js', 'index.html', 'README.md', 'package.json') { Copy-Item "$Twin\tools\service-panel\$f" "$App\service-panel" -Force }
Copy-Item "$Kylin\services.kylin.json" "$App\service-panel" -Force
Get-ChildItem $Kylin -File | Where-Object { $_.Name -match '\.sh$|^xy\.env\.example$|^\.gitattributes$' } | Copy-Item -Destination $Work -Force
if (Test-Path "$Kylin\运维手册") { Mirror "$Kylin\运维手册" "$Work\docs" }
$arches = @('x64'); if ($WithArm64 -or (Test-Path "$Work\packages\node-arm64.tar.xz")) { $arches += 'arm64' }
foreach ($a in $arches) {
  foreach ($f in "node-$a.tar.xz", "mediamtx-$a.tar.gz", "ffmpeg-$a.gz") {
    if (-not (Test-Path "$Work\packages\$f") -or (Get-Item "$Work\packages\$f").Length -ne (Get-Item "$Runtimes\$f").Length) { Copy-Item "$Runtimes\$f" "$Work\packages" -Force }
  }
  $sum = foreach ($f in "node-$a.tar.xz", "mediamtx-$a.tar.gz", "ffmpeg-$a.gz") { "$((Get-FileHash "$Work\packages\$f" -Algorithm SHA256).Hash.ToLower())  $f" }
  [IO.File]::WriteAllText("$Work\packages\$a.sha256", ($sum -join "`n") + "`n", $Utf8)
}
[IO.File]::WriteAllText("$Work\.gitignore", "# 一体机本地内容（数据、现场配置、日志、备份、解压后的运行时）不进仓库`n/data/`n/data.*/`n/local/`n/logs/`n/run/`n/backups/`n/runtime/`n", $Utf8)
$readme = @"
# 新耀工厂数字孪生 · 国产化一体机部署包

本分支只包含**构建好的程序**（新耀工厂大屏、TwinStudio 平台与前端、服务控制面板、运行时、运维脚本），不含源码与数据。

- 运维手册：用浏览器打开 ``docs/运维手册.html``
- 首次部署：数据包文件夹传到桌面 → ``bash xy.sh import-data`` → ``bash xy.sh install``
- 更新版本：``bash xy.sh upgrade``（或双击「3-检查并更新版本.sh」）
- 当前版本：见 ``VERSION``
"@
[IO.File]::WriteAllText("$Work\README.md", ($readme -replace "`r`n", "`n"), $Utf8)

# ---------------------------------------------------------------- 4. 版本号与提交
$stamp = Get-Date -Format 'yyyy.MM.dd-HHmm'
$webSdk = (Get-Content "$Twin\packages\web-sdk\package.json" -Raw | ConvertFrom-Json).version
$ver = "$stamp · 大屏 $(Rev $Proj) · 平台 $(Rev $Twin) · web-sdk $webSdk"
[IO.File]::WriteAllText("$Work\VERSION", "$ver`n更新内容：$Note`n", $Utf8)
G -C $Work add -A | Out-Null
if (-not (G -C $Work status --porcelain)) { Write-Host '没有变化，无需发布' -ForegroundColor Yellow; exit 0 }
Step '变更概览'
G -C $Work diff --cached --stat | Select-Object -Last 6
$name = (G -C $Proj log -1 --format=%an | Select-Object -Last 1); $mail = (G -C $Proj log -1 --format=%ae | Select-Object -Last 1)
G -C $Work -c "user.name=$name" -c "user.email=$mail" commit -q -m "$stamp $Note" -m $ver | Out-Null; Must '提交'
Write-Host "  提交：$(G -C $Work log -1 --format='%h %s')"

if ($Bundle) {
  $out = "E:\All_in_wdp\deploy-build\updates\xy-kylin-$stamp.bundle"
  New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
  G -C $Work bundle create $out $Branch | Out-Null; Must '生成离线更新包'
  "离线更新包：$out（{0:N1} MB）→ 向日葵传到一体机桌面后：bash xy.sh upgrade desktop" -f ((Get-Item $out).Length / 1MB)
}
if (-not $NoPush) {
  Step "推送到 GitHub（$Branch）"
  G -C $Work push -q origin "HEAD:$Branch" | ForEach-Object { "  $_" }; Must '推送'
  Write-Host "`n发布完成：$ver`n一体机执行 bash xy.sh upgrade（或双击「3-检查并更新版本.sh」）即可更新。" -ForegroundColor Green
} else {
  Write-Host "`n已生成但未推送（-NoPush）。确认无误后：git -C $Work push origin HEAD:$Branch" -ForegroundColor Yellow
}
