# tools/prepare-brand.ps1
# Genera el logo in-app (águila LPF blanca sobre fondo transparente) a partir de
# assets/lpf-logo.png (lockup plano navy sobre blanco). Sustituye al antiguo
# shield.webp (escudo 3D) usado en AuthHeader / DesktopNotice / InstallModal.
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\prepare-brand.ps1
$ErrorActionPreference = 'Stop'

$root      = Split-Path -Parent $PSScriptRoot
$logo      = Join-Path $root 'assets\lpf-logo.png'
$srcAssets = Join-Path $root 'src\assets'
$ffmpeg    = 'ffmpeg'

New-Item -ItemType Directory -Force -Path $srcAssets | Out-Null

# Recorta el águila (bbox x19..226, y126..374, 208x249), quita el fondo blanco
# (colorkey) y la pinta de blanco (RGB=255, alfa intacto) para que contraste
# sobre fondos oscuros (#04121f / #001222).
$filter = 'crop=208:249:19:126,format=rgb24,colorkey=0xFFFFFF:0.25:0.05,format=rgba,lutrgb=r=255:g=255:b=255'
& $ffmpeg -hide_banner -loglevel error -y -i $logo -vf $filter -c:v libwebp -lossless 1 "$srcAssets\logo-lpf.webp"
if ($LASTEXITCODE -ne 0) { throw 'ffmpeg logo-lpf.webp falló' }

# Variante en tinta oscura (#0b1220) para el documento "INFORME DEL ÁRBITRO" sobre hoja
# blanca: misma águila recortada, pero pintada de negro azulado (contraste sobre blanco).
$inkFilter = 'crop=208:249:19:126,format=rgb24,colorkey=0xFFFFFF:0.25:0.05,format=rgba,lutrgb=r=11:g=18:b=32'
& $ffmpeg -hide_banner -loglevel error -y -i $logo -vf $inkFilter -c:v libwebp -lossless 1 "$srcAssets\lpf-ink.webp"
if ($LASTEXITCODE -ne 0) { throw 'ffmpeg lpf-ink.webp falló' }

Write-Host '=== src/assets ==='
Get-ChildItem $srcAssets | Select-Object Name, Length | Format-Table -AutoSize
