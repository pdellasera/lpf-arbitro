# tools/prepare-assets.ps1
# Optimiza los assets del mockup LPF (WebP) y genera previews reducidos
# para inspección visual. Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\prepare-assets.ps1
$ErrorActionPreference = 'Stop'

$root      = Split-Path -Parent $PSScriptRoot          # repo root
$srcAssets = Join-Path $root 'src\assets'
$preview   = Join-Path $root 'tools\_preview'
$ffmpeg    = 'ffmpeg'

New-Item -ItemType Directory -Force -Path $srcAssets | Out-Null
New-Item -ItemType Directory -Force -Path $preview   | Out-Null

# --- Previews (solo inspección humana) ---
& $ffmpeg -hide_banner -loglevel error -y -i "$root\assets\logo.png"             -vf 'scale=700:-1' "$preview\logo_700.png"
if ($LASTEXITCODE -ne 0) { throw "ffmpeg preview logo falló" }
& $ffmpeg -hide_banner -loglevel error -y -i "$root\assets\login_screem.png"     -vf 'scale=600:-1' "$preview\screen_600.png"
if ($LASTEXITCODE -ne 0) { throw "ffmpeg preview screen falló" }
& $ffmpeg -hide_banner -loglevel error -y -i "$root\assets\login_background.png" -vf 'scale=500:-1' "$preview\bg_500.png"
if ($LASTEXITCODE -ne 0) { throw "ffmpeg preview bg falló" }

# --- Assets finales optimizados ---
& $ffmpeg -hide_banner -loglevel error -y -i "$root\assets\login_background.png" -c:v libwebp -quality 82 -compression_level 6 "$srcAssets\login_background.webp"
if ($LASTEXITCODE -ne 0) { throw "ffmpeg bg webp falló" }
# Escudo (solo el shield, recortado del lockup): bbox shield ~ x158-800, y58-740
& $ffmpeg -hide_banner -loglevel error -y -i "$root\assets\logo.png" -vf "crop=645:685:155:55" -c:v libwebp -lossless 1 "$srcAssets\shield.webp"
if ($LASTEXITCODE -ne 0) { throw "ffmpeg shield webp falló" }

Write-Host '=== src/assets ==='
Get-ChildItem $srcAssets | Select-Object Name, Length | Format-Table -AutoSize
Write-Host '=== tools/_preview ==='
Get-ChildItem $preview | Select-Object Name, Length | Format-Table -AutoSize
