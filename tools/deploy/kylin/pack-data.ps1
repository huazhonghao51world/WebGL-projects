# 打包平台全部数据为离线数据包（在开发电脑执行；服务运行中即可，热快照不停机），再用向日葵把整个文件夹传到一体机桌面
#
# 内容：platform.sqlite（一致性快照）+ objects/（全部模型、贴图、配置包、发布版本）+ vtk-cache + 交付码 / 访问密钥
#       + 现场配置模板 _site/（dengta-config.json、xy-cameras.yml，一体机上没有时才导入）
# 输出：<Out>\xy-data-<日期>\xy-data.tar.gz.part-000…（每片 ≤ 3.5 GB）+ xy-data.sha256 + 说明.txt
#
# 用法：powershell -File tools\deploy\kylin\pack-data.ps1 [-Out <输出目录>]
# 传输：向日葵「远程文件」把整个 xy-data-<日期> 文件夹拖到一体机桌面 → 一体机执行 bash xy.sh import-data（自动找桌面）
param(
  [string]$Out = 'E:\All_in_wdp\wdpapi_sdk\threejs-twin-research\xy-deploy-data-package',
  [string]$Source = 'E:\All_in_wdp\wdpapi_sdk\threejs-twin-p0\.data'
)
$ErrorActionPreference = 'Stop'
$Proj = (Resolve-Path "$PSScriptRoot\..\..\..").Path
$stamp = Get-Date -Format 'yyyyMMdd-HHmm'
$dst = Join-Path $Out "xy-data-$stamp"
$stage = Join-Path $env:TEMP "xy-data-$stamp"
$Utf8 = New-Object Text.UTF8Encoding($false)

Write-Host "== 1/4 热快照 $Source（不停机）"
node "$Proj\tools\deploy\snapshot-data.mjs" $Source $stage
if ($LASTEXITCODE) { throw '快照失败' }

Write-Host '== 2/4 附带现场配置模板'
New-Item -ItemType Directory -Force "$stage\_site" | Out-Null
$cfg = [IO.File]::ReadAllText("$Proj\public\config.json") -replace '"serverUrl":\s*"[^"]*"', '"serverUrl": "/api"'
[IO.File]::WriteAllText("$stage\_site\dengta-config.json", $cfg, $Utf8)
$cam = "$Proj\tools\rtsp\xy-cameras.yml"
if (Test-Path $cam) {
  # 一体机为 Linux：ffmpeg 不带 .exe，且已在 PATH 中
  $t = [IO.File]::ReadAllText($cam) -replace '\./ffmpeg\.exe', 'ffmpeg' -replace 'ffmpeg\.exe', 'ffmpeg'
  [IO.File]::WriteAllText("$stage\_site\xy-cameras.yml", $t, $Utf8)
}

Write-Host '== 3/4 压缩并分片（约 3 GB，需几分钟）'
New-Item -ItemType Directory -Force $dst | Out-Null
$tar = Join-Path $env:TEMP "xy-data-$stamp.tar.gz"
tar -czf $tar -C $stage .
if ($LASTEXITCODE) { throw '压缩失败' }
$chunk = [long]3500MB
$in = [IO.File]::OpenRead($tar)
try {
  $buf = New-Object byte[] (64MB); $i = 0
  while ($in.Position -lt $in.Length) {
    $part = Join-Path $dst ('xy-data.tar.gz.part-{0:D3}' -f $i)
    $o = [IO.File]::Create($part); [long]$written = 0
    try {
      while ($written -lt $chunk -and ($n = $in.Read($buf, 0, [int][Math]::Min([long]$buf.Length, [long]($chunk - $written)))) -gt 0) { $o.Write($buf, 0, $n); $written += $n }
    } finally { $o.Close() }
    $i++
  }
} finally { $in.Close() }
Remove-Item $tar, $stage -Recurse -Force

Write-Host '== 4/4 生成校验文件'
$lines = Get-ChildItem $dst -Filter 'xy-data.tar.gz.part-*' | Sort-Object Name | ForEach-Object { "$((Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower())  $($_.Name)" }
[IO.File]::WriteAllText("$dst\xy-data.sha256", ($lines -join "`n") + "`n", $Utf8)
$readme = @"
新耀工厂数字孪生 · 平台数据包（$stamp）

包含：数据库（案例、资产、发布版本、交付码、AI小新会话与模型配置）、全部模型与贴图对象、仿真缓存、现场配置模板。
导入（一体机终端，部署目录下执行）：
  bash xy.sh import-data            （本文件夹在桌面上时可直接执行，会自动找到）
  bash xy.sh import-data "<本目录完整路径>"   （放在其他位置时）
导入前会自动校验文件完整性；本机原有数据会改名保留（data.before-import-时间），不会丢失。
"@
[IO.File]::WriteAllText("$dst\说明.txt", ($readme -replace "`r`n", "`n"), $Utf8)
$size = (Get-ChildItem $dst -File | Measure-Object Length -Sum).Sum
Write-Host ("`n完成：{0}（{1:N2} GB，{2} 片）" -f $dst, ($size / 1GB), $lines.Count) -ForegroundColor Green
