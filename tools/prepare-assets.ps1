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
& $ffmpeg -hide_banner -loglevel error -y -i "$root\assets\logo.png" -vf "crop=645:685:155:55" -c:v png -compression_level 6 "$srcAssets\shield.png"
if ($LASTEXITCODE -ne 0) { throw "ffmpeg shield png falló" }

# Verificación del recorte del escudo (bbox contenido):
Add-Type -AssemblyName System.Drawing
$s = [System.Drawing.Bitmap]::FromFile((Join-Path $srcAssets 'shield.png'))
$minX=$s.Width;$maxX=0;$minY=$s.Height;$maxY=0
for($y=0;$y -lt $s.Height;$y+=2){ for($x=0;$x -lt $s.Width;$x+=2){
  if($s.GetPixel($x,$y).A -gt 10){ if($x-lt$minX){$minX=$x}; if($x-gt$maxX){$maxX=$x}; if($y-lt$minY){$minY=$y}; if($y-gt$maxY){$maxY=$y} }
}}
Write-Host ("shield.png {0}x{1}  contenido: x {2}..{3} y {4}..{5}" -f $s.Width,$s.Height,$minX,$maxX,$minY,$maxY)
$s.Dispose()

Write-Host '=== src/assets ==='
Get-ChildItem $srcAssets | Select-Object Name, Length | Format-Table -AutoSize
Write-Host '=== tools/_preview ==='
Get-ChildItem $preview | Select-Object Name, Length | Format-Table -AutoSize
