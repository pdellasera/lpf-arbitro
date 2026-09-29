# tools/measure-referee.ps1 — bbox de la camiseta verde (arbitro) en hero mockup vs login.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$imgHome = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
$imgLogin = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_background.png'))
$imgBg = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_background.png'))

function GreenBox($bmp, [int]$y0, [int]$y1) {
  $minX=$bmp.Width; $maxX=0; $minY=$y1; $maxY=$y0; $n=0
  for ($y=$y0; $y -le $y1; $y+=2) { for ($x=0; $x -lt $bmp.Width; $x+=2) {
    $p=$bmp.GetPixel($x,$y)
    if ($p.G -gt 170 -and $p.G -gt ($p.R+40) -and $p.R -gt ($p.B+15)) {
      $n++
      if ($x -lt $minX) {$minX=$x}; if ($x -gt $maxX) {$maxX=$x}
      if ($y -lt $minY) {$minY=$y}; if ($y -gt $maxY) {$maxY=$y}
    }
  }}
  return ('verde-lima bbox x{0}..{1} (w={2}) y{3}..{4} (h={5}) n={6}' -f $minX,$maxX,($maxX-$minX),$minY,$maxY,($maxY-$minY),$n)
}

Write-Output ('HOME hero (y0..467):  ' + (GreenBox $imgHome 0 467))
Write-Output ('HOME full (y0..1671):  ' + (GreenBox $imgHome 0 1671))
Write-Output ('LOGIN full:             ' + (GreenBox $imgLogin 0 ($imgLogin.Height-1)))
Write-Output ('home_background full:   ' + (GreenBox $imgBg 0 ($imgBg.Height-1)))
$imgHome.Dispose(); $imgLogin.Dispose(); $imgBg.Dispose()
