# tools/measure-home3.ps1 — margenes, runs de pills/equipos, limites de cards, promedios.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
$W = $bmp.Width; $H = $bmp.Height
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }
function Sat([int]$r,[int]$g,[int]$b){ [int]([Math]::Max($r,[Math]::Max($g,$b)) - [Math]::Min($r,[Math]::Min($g,$b))) }
function Hex($p){ ('#{0:X2}{1:X2}{2:X2}' -f $p.R,$p.G,$p.B) }

Write-Output '=== margen lateral: colores x=0..90 en y=700 (card1) y y=1050 (card2) ==='
foreach ($y in @(700,1050)) {
  $str=''
  foreach ($x in @(0,10,20,30,40,50,60,70,75,80,84,88,92,96,100)) {
    $str += (' x{0}={1}' -f $x,(Hex $bmp.GetPixel($x,$y)))
  }
  Write-Output ('y={0}:{1}' -f $y,$str)
  $str=''
  foreach ($x in @(840,845,850,855,860,870,880,890,900,910,920,930,940)) {
    $str += (' x{0}={1}' -f $x,(Hex $bmp.GetPixel($x,$y)))
  }
  Write-Output ('y={0} (der):{1}' -f $y,$str)
}

function Runs([int]$y, [int]$x0, [int]$x1) {
  $out = @()
  $in = $false; $s = 0
  for ($x=$x0; $x -le $x1; $x++) {
    $p = $bmp.GetPixel($x,$y); $L = Lum $p.R $p.G $p.B; $sat = Sat $p.R $p.G $p.B
    $ink = ($L -lt 205) -or ($sat -gt 45)
    if ($ink -and -not $in) { $in=$true; $s=$x }
    elseif ((-not $ink) -and $in) { $in=$false; $out += ('{0}-{1}' -f $s,($x-1)) }
  }
  if ($in) { $out += ('{0}-{1}' -f $s,$x1) }
  return ($out -join ' ')
}

Write-Output ''
Write-Output '=== runs (elementos oscuros/saturados) ==='
foreach ($y in @(505,628,640,724,760,838,1044,1076,1158,1358,1391,1472,1560)) {
  Write-Output ('y={0,4}: {1}' -f $y, (Runs $y 0 ($W-1)))
}

Write-Output ''
Write-Output '=== limites verticales en x=84 (borde card) y x=470 (centro) ==='
foreach ($xx in @(84,470)) {
  $prev=-1
  $line=''
  for ($y=560; $y -lt 1560; $y++) {
    $p=$bmp.GetPixel($xx,$y); $L=Lum $p.R $p.G $p.B
    if ([Math]::Abs($L-$prev) -gt 20) { $line += (' y{0}={1}' -f $y,$L); $prev=$L }
  }
  Write-Output ('x={0}:{1}' -f $xx,$line)
}

Write-Output ''
Write-Output '=== promedios de color (zonas solidas 12x12) ==='
function Avg([int]$x,[int]$y) {
  $r=0;$g=0;$b=0;$n=0
  for ($i=$x;$i -lt $x+12;$i++){ for ($j=$y;$j -lt $y+12;$j++){ $p=$bmp.GetPixel($i,$j);$r+=$p.R;$g+=$p.G;$b+=$p.B;$n++ } }
  return ('#{0:X2}{1:X2}{2:X2}' -f [int]($r/$n),[int]($g/$n),[int]($b/$n))
}
Write-Output ('pill activa azul     ' + (Avg 190 515))
Write-Output ('pill inactiva bg     ' + (Avg 300 515))
Write-Output ('badge verde texto bg ' + (Avg 150 630))
Write-Output ('card1 tinte          ' + (Avg 300 700))
Write-Output ('card2 bg             ' + (Avg 300 1060))
Write-Output ('card3 bg             ' + (Avg 300 1280))
Write-Output ('page bg (bajo cards) ' + (Avg 470 930))
Write-Output ('page bg (x=470 gap)  ' + (Avg 470 620))
Write-Output ('divisor card1        ' + (Avg 470 900))
Write-Output ('tab bar bg           ' + (Avg 200 1620))
Write-Output ('sheet top            ' + (Avg 470 475))
$bmp.Dispose()
