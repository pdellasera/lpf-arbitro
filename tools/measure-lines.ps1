# tools/measure-lines.ps1
# Escaneos horizontales/verticales precisos de la tarjeta.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
$W = $bmp.Width; $H = $bmp.Height

function Hex([int]$r,[int]$g,[int]$b){ '{0:X2}{1:X2}{2:X2}' -f $r,$g,$b }

function HLine([int]$y,[int]$x0,[int]$x1,[int]$step) {
  $prev=''; $out = ("H y={0}: " -f $y)
  for ($x=$x0; $x -le $x1; $x+=$step) {
    $p=$bmp.GetPixel($x,$y); $h = Hex $p.R $p.G $p.B
    if ($h -ne $prev) { $out += ("[{0}]{1} " -f $x,$h); $prev=$h }
  }
  Write-Output $out
}
function VLine([int]$x,[int]$y0,[int]$y1,[int]$step) {
  $prev=''; $out = ("V x={0}: " -f $x)
  for ($y=$y0; $y -le $y1; $y+=$step) {
    $p=$bmp.GetPixel($x,$y); $h = Hex $p.R $p.G $p.B
    if ($h -ne $prev) { $out += ("[{0}]{1} " -f $y,$h); $prev=$h }
  }
  Write-Output $out
}

foreach ($y in @(930,960,1000,1040,1080,1120,1140,1170,1200,1240,1265,1290,1330,1370,1420,1460,1470,1500,1540,1580,1620,1640)) {
  HLine $y 60 840 2
}
Write-Output ''
VLine 300 840 1620 2
VLine 470 840 1620 2
VLine 620 840 1620 2
Write-Output ''
Write-Output '=== muestras puntuales ==='
foreach ($pt in @(@(470,1030),@(470,1120),@(300,1120),@(470,1200),@(470,1265),@(470,1460),@(200,1460),@(700,1460),@(470,1550),@(470,1610),@(200,1120),@(700,1120),@(200,1200),@(700,1200),@(470,950),@(470,900))) {
  $p=$bmp.GetPixel($pt[0],$pt[1])
  Write-Output ('({0},{1}) = {2}' -f $pt[0],$pt[1],(Hex $p.R $p.G $p.B))
}
$bmp.Dispose()
