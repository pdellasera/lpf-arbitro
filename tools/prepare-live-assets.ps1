# tools/prepare-live-assets.ps1 — recorta avatares del panel y texturas de graderío del mockup.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\partido_screem.png'))
$outPlayers = Join-Path $root 'src\assets\players'
$outLive    = Join-Path $root 'src\assets\live'
New-Item -ItemType Directory -Force -Path $outPlayers | Out-Null
New-Item -ItemType Directory -Force -Path $outLive    | Out-Null

function Crop([string]$name,[int]$x0,[int]$y0,[int]$x1,[int]$y1){
  $cw = $x1-$x0+1; $ch = $y1-$y0+1
  $crop = New-Object System.Drawing.Bitmap $cw, $ch, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($crop)
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0,0,$cw,$ch), (New-Object System.Drawing.Rectangle $x0,$y0,$cw,$ch), ([System.Drawing.GraphicsUnit]::Pixel))
  $g.Dispose()
  $png = Join-Path $outLive ($name + '.png')
  $crop.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
  Write-Output ($name + ' -> ' + $cw + 'x' + $ch)
}

# Avatares (4 filas del panel): círculos centrados en x~1353, y 372/426/482/538
$ay = @(372, 426, 482, 538)
for($i=0;$i -lt $ay.Count;$i++){
  $y0 = $ay[$i]-23; $y1 = $ay[$i]+22
  $name = 'p' + ($i+1)
  $cw=46; $ch=46; $x0=1330; $y0c=$y0
  $crop = New-Object System.Drawing.Bitmap $cw, $ch, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($crop)
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0,0,$cw,$ch), (New-Object System.Drawing.Rectangle $x0,$y0c,$cw,$ch), ([System.Drawing.GraphicsUnit]::Pixel))
  $g.Dispose()
  $png = Join-Path $outPlayers ($name + '.png')
  $crop.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
  Write-Output ($name + ' avatar -> 46x46 @ y' + $y0c)
}

# Graderío: franja derecha del campo (sin UI) y banda superior (a la derecha de la píldora)
Crop 'crowd-side' 1200 150 1269 700
Crop 'crowd-top'  1042 66 1195 140

$bmp.Dispose()

# Convertir a webp (mismo flujo que prepare-crests.ps1)
foreach($dir in @($outPlayers, $outLive)){
  Get-ChildItem (Join-Path $dir '*.png') | ForEach-Object {
    $webp = Join-Path $dir ([System.IO.Path]::GetFileNameWithoutExtension($_.Name) + '.webp')
    & ffmpeg -hide_banner -loglevel error -y -i $_.FullName -c:v libwebp -quality 88 $webp
    if($LASTEXITCODE -eq 0){ Remove-Item $_.FullName -Force }
  }
}
Write-Output '=== assets generados ==='
Get-ChildItem $outPlayers, $outLive | ForEach-Object { Write-Output ($_.FullName + '  ' + $_.Length + ' bytes') }
