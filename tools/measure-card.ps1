# tools/measure-card.ps1
# Mapa fino + detección de texto/botón dentro de la tarjeta (y header).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
$W = $bmp.Width; $H = $bmp.Height

function Hex([int]$r,[int]$g,[int]$b){ '{0:X2}{1:X2}{2:X2}' -f $r,$g,$b }
function IsWhite($p){ $p.R -gt 195 -and $p.G -gt 195 -and $p.B -gt 195 }
function IsBlue($p){ $p.B -gt 150 -and ($p.B-$p.R) -gt 60 -and ($p.B-$p.G) -gt 40 }

Write-Output '=== HEX MAP tarjeta (30px, x40..940, y780..1672) ==='
for ($y=780; $y -le 1672; $y+=30) {
  $line=''
  for ($x=40; $x -le 940; $x+=30) {
    $p=$bmp.GetPixel($x,$y); $line += (Hex $p.R $p.G $p.B)+' '
  }
  Write-Output ('y{0,4} {1}' -f $y,$line.Trim())
}

Write-Output ''
Write-Output '=== HEADER (y 350..820): filas con blanco (texto) ==='
for ($y=350; $y -le 820; $y+=2) {
  $minX=-1; $maxX=-1; $cnt=0
  for ($x=0; $x -lt $W; $x+=3) {
    if (IsWhite $bmp.GetPixel($x,$y)) { $cnt++; if ($minX -lt 0){$minX=$x}; $maxX=$x }
  }
  if ($cnt -gt 2) { Write-Output ('y={0} white x{1}..{2} n={3}' -f $y,$minX,$maxX,$cnt) }
}

Write-Output ''
Write-Output '=== CARD (y 780..1672): filas con blanco (texto) ==='
for ($y=780; $y -le 1672; $y+=2) {
  $minX=-1; $maxX=-1; $cnt=0
  for ($x=0; $x -lt $W; $x+=3) {
    if (IsWhite $bmp.GetPixel($x,$y)) { $cnt++; if ($minX -lt 0){$minX=$x}; $maxX=$x }
  }
  if ($cnt -gt 2) { Write-Output ('y={0} white x{1}..{2} n={3}' -f $y,$minX,$maxX,$cnt) }
}

Write-Output ''
Write-Output '=== CARD (y 780..1672): filas con azul (boton/link) ==='
for ($y=780; $y -le 1672; $y+=2) {
  $minX=-1; $maxX=-1; $cnt=0
  for ($x=0; $x -lt $W; $x+=3) {
    if (IsBlue $bmp.GetPixel($x,$y)) { $cnt++; if ($minX -lt 0){$minX=$x}; $maxX=$x }
  }
  if ($cnt -gt 2) { Write-Output ('y={0} blue x{1}..{2} n={3}' -f $y,$minX,$maxX,$cnt) }
}

$bmp.Dispose()
