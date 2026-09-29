# tools/prepare-pwa-icons.ps1
# Genera los iconos PWA (manifest, iOS, favicon) a partir del escudo del logo LPF.
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\prepare-pwa-icons.ps1
$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot
$logo   = Join-Path $root 'assets\logo.png'
$out    = Join-Path $root 'public\icons'
$ffmpeg = 'ffmpeg'

New-Item -ItemType Directory -Force -Path $out | Out-Null

# Bbox del escudo en el lockup (mismo recorte que tools/prepare-assets.ps1).
$crop = 'crop=645:685:155:55'

function Icon($name, $filter) {
  & $ffmpeg -hide_banner -loglevel error -y -i $logo -vf "$crop,$filter" (Join-Path $out $name)
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg falló para $name" }
}

Icon 'icon-192.png'          'scale=165:175,pad=192:192:13:8:color=0x04121f'
Icon 'icon-512.png'          'scale=440:467,pad=512:512:36:22:color=0x04121f'
Icon 'icon-maskable-512.png' 'scale=338:359,pad=512:512:87:76:color=0x04121f'
Icon 'apple-touch-icon.png'  'scale=138:146,pad=180:180:21:17:color=0x04121f'
Icon 'favicon.png'           'scale=38:40,pad=48:48:5:4:color=0x04121f'

Write-Host '=== public/icons ==='
Get-ChildItem $out | Select-Object Name, Length | Format-Table -AutoSize
