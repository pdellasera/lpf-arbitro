# tools/map-homebg.ps1 — mapa ASCII de home_background.png (qué imagen es).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$a = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_background.png'))
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }
$W=$a.Width; $H=$a.Height
$cols=[int]($W/24); $rows=[int]($H/24)
for ($ry=0; $ry -lt $rows; $ry++) {
  $line=''
  for ($cx=0; $cx -lt $cols; $cx++) {
    $x=[Math]::Min($cx*24+12,$W-1); $y=[Math]::Min($ry*24+12,$H-1)
    $p=$a.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
    if ($L -lt 12) { $line+='#' } elseif ($L -lt 28) { $line+=':' } elseif ($L -lt 50) { $line+='=' } elseif ($L -lt 80) { $line+='+' } elseif ($L -lt 120) { $line+='-' } elseif ($L -lt 170) { $line+='.' } else { $line+=' ' }
  }
  Write-Output ('{0,3} {1}' -f $ry,$line)
}
$a.Dispose()
