# tools/read-icons2.ps1 — iconos restantes a 1px.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }
function Dump([string]$label,[int]$x0,[int]$y0,[int]$x1,[int]$y1) {
  Write-Output ('--- {0} ---' -f $label)
  for ($y=$y0; $y -le $y1; $y++) {
    $row=''
    for ($x=$x0; $x -le $x1; $x++) {
      $p=$bmp.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
      if ($L -lt 90) { $row+='#' } elseif ($L -lt 160) { $row+='+' } else { $row+='.' }
    }
    Write-Output $row
  }
  Write-Output ''
}
Dump 'tab icon1 casa' 104 1544 186 1582
Dump 'tab icon2 informes' 264 1544 346 1582
Dump 'tab icon3 stats' 424 1544 506 1582
Dump 'tab icon4 calendario' 584 1544 666 1582
$bmp.Dispose()
