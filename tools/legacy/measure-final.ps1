# tools/measure-final.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
function Hex([int]$r,[int]$g,[int]$b){ '{0:X2}{1:X2}{2:X2}' -f $r,$g,$b }
function HLine([int]$y,[int]$x0,[int]$x1,[int]$step) {
  $prev=''; $out = ("y={0}: " -f $y)
  for ($x=$x0; $x -le $x1; $x+=$step) {
    $p=$bmp.GetPixel($x,$y); $h = Hex $p.R $p.G $p.B
    if ($h -ne $prev) { $out += ("[{0}]{1} " -f $x,$h); $prev=$h }
  }
  Write-Output $out
}
foreach ($y in @(1508,1512,1516,1520,1528,1540,1550,1560,1570)) { HLine $y 140 800 3 }
Write-Output '--- inputs ---'
foreach ($y in @(1076,1080,1096,1102,1110,1120,1128,1134)) { HLine $y 140 800 3 }
Write-Output '--- input2 ---'
foreach ($y in @(1178,1184,1190,1196,1204,1212,1220,1228)) { HLine $y 140 900 3 }
$bmp.Dispose()
