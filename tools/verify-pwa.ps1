# tools/verify-pwa.ps1
# Comprueba que el build contiene los artefactos PWA y que index.html los referencia.
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-pwa.ps1
$ErrorActionPreference = 'Stop'

$root  = Split-Path -Parent $PSScriptRoot
$dist  = Join-Path $root 'dist'
$failed = $false

function Fail($msg) {
  Write-Host "FAIL: $msg" -ForegroundColor Red
  $script:failed = $true
}

$manifest = Join-Path $dist 'manifest.webmanifest'
$sw       = Join-Path $dist 'sw.js'
$index    = Join-Path $dist 'index.html'

if (-not (Test-Path $manifest)) {
  Fail 'falta dist/manifest.webmanifest'
} else {
  Write-Host 'manifest.webmanifest       OK'
  $j = Get-Content $manifest -Raw | ConvertFrom-Json
  if (-not $j.name) { Fail 'manifest sin name' }
  if ($j.display -ne 'standalone') { Fail 'manifest.display != standalone' }
  if (-not $j.icons -or $j.icons.Count -eq 0) { Fail 'manifest sin icons' }
  foreach ($i in $j.icons) {
    $p = Join-Path $dist ($i.src.TrimStart('/').Replace('/', '\'))
    if (-not (Test-Path $p)) { Fail "icon no existe: $($i.src)" } else { Write-Host "icon $($i.src)       OK" }
  }
}

if (-not (Test-Path $sw)) { Fail 'falta dist/sw.js' } else { Write-Host 'sw.js                     OK' }

$swDev = Join-Path $dist 'sw-dev.js'
if (-not (Test-Path $swDev)) {
  Fail 'falta dist/sw-dev.js'
} else {
  $swDevContent = Get-Content $swDev -Raw
  if ($swDevContent -notmatch "addEventListener\('fetch'") {
    Fail 'sw-dev.js sin handler fetch'
  } else {
    Write-Host 'sw-dev.js                OK'
  }
}

if (Test-Path $index) {
  $html = Get-Content $index -Raw
  if ($html -notmatch 'rel="manifest"') { Fail 'index.html sin <link rel="manifest">' } else { Write-Host 'index.html rel=manifest   OK' }
  if ($html -notmatch 'apple-touch-icon') { Fail 'index.html sin apple-touch-icon' } else { Write-Host 'index.html apple-touch-icon OK' }
} else {
  Fail 'falta dist/index.html'
}

if ($failed) { Write-Host 'VERIFY PWA: FALLO' -ForegroundColor Red; exit 1 }
Write-Host 'VERIFY PWA: OK' -ForegroundColor Green
