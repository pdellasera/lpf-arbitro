# tools/prepare-pwa-icons.ps1
# Genera los iconos PWA a partir del águila LPF (assets/lpf-logo.png).
# Resultado: águila BLANCA sobre placa navy #04121f opaca, con padding real y un
# icono maskable DISTINTO (águila al ~60% dentro de la safe zone circular).
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\prepare-pwa-icons.ps1
$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot
$logo   = Join-Path $root 'assets\lpf-logo.png'
$out    = Join-Path $root 'public\icons'
$tmp    = Join-Path $root 'tools\_preview'
$ffmpeg = 'ffmpeg'
$PLATE  = '0x04121f'

New-Item -ItemType Directory -Force -Path $out | Out-Null
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

# Águila blanca sobre alfa (bbox x19..226, y126..374, 208x249).
$eagle = Join-Path $tmp 'eagle-white.png'
$eagleFilter = 'crop=208:249:19:126,format=rgb24,colorkey=0xFFFFFF:0.25:0.05,format=rgba,lutrgb=r=255:g=255:b=255'
& $ffmpeg -hide_banner -loglevel error -y -i $logo -vf $eagleFilter $eagle
if ($LASTEXITCODE -ne 0) { throw 'falló el recorte del águila blanca' }

# name, canvas, águila WxH (alto = % del lienzo)
$icons = @(
  @('icon-192.png',          192, 126, 150),
  @('icon-512.png',          512, 334, 400),
  @('icon-maskable-512.png', 512, 256, 306),
  @('apple-touch-icon.png',  180, 118, 140),
  @('favicon.png',            48,  34,  40)
)

foreach ($i in $icons) {
  $name = $i[0]; $s = $i[1]; $w = $i[2]; $h = $i[3]
  $x = [int](($s - $w) / 2)
  $y = [int](($s - $h) / 2)
  $dst = Join-Path $out $name
  & $ffmpeg -hide_banner -loglevel error -y -i $eagle `
    -filter_complex "color=c=${PLATE}:s=${s}x${s}:r=1,format=rgb24[bg];[0:v]scale=${w}:${h}[e];[bg][e]overlay=${x}:${y}:format=rgb" -frames:v 1 $dst
  if ($LASTEXITCODE -ne 0) { throw "falló $name" }
}

Write-Host '=== public/icons ==='
Get-ChildItem $out | Select-Object Name, Length | Format-Table -AutoSize
