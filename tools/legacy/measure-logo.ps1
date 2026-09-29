# tools/measure-logo.ps1
# Mapa alpha + colores del logo.png (2006x784).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\logo.png'))
$W = $bmp.Width; $H = $bmp.Height
Write-Output ("logo: {0}x{1}" -f $W,$H)

function Hex([int]$r,[int]$g,[int]$b){ '{0:X2}{1:X2}{2:X2}' -f $r,$g,$b }

Write-Output '=== MAPA ALPHA (grid 50px, #=opaco .=transparente ~=semi) ==='
$cols=[int]($W/50); $rows=[int]($H/50)
for ($ry=0; $ry -lt $rows; $ry++) {
  $line=''
  for ($cx=0; $cx -lt $cols; $cx++) {
    $x=[Math]::Min($cx*50+25,$W-1); $y=[Math]::Min($ry*50+25,$H-1)
    $a=$bmp.GetPixel($x,$y).A
    if ($a -gt 200){$line+='#'} elseif ($a -gt 40){$line+='~'} else {$line+='.'}
  }
  Write-Output ('y{0,3} {1}' -f ($ry*50),$line)
}

Write-Output ''
Write-Output '=== bbox contenido (alpha>10, grid 4px) ==='
$minX=$W;$maxX=0;$minY=$H;$maxY=0
for ($y=0; $y -lt $H; $y+=4) { for ($x=0; $x -lt $W; $x+=4) {
  if ($bmp.GetPixel($x,$y).A -gt 10) { if($x-lt$minX){$minX=$x}; if($x-gt$maxX){$maxX=$x}; if($y-lt$minY){$minY=$y}; if($y-gt$maxY){$maxY=$y} }
}}
Write-Output ('bbox: x {0}..{1} (w={2}), y {3}..{4} (h={5})' -f $minX,$maxX,($maxX-$minX),$minY,$maxY,($maxY-$minY))

Write-Output ''
Write-Output '=== colores opacos por banda (filas clave) ==='
foreach ($y in @(50,150,250,350,450,550,650,750)) {
  $line=''
  for ($cx=0; $cx -lt $cols; $cx++) {
    $x=[Math]::Min($cx*50+25,$W-1)
    $p=$bmp.GetPixel($x,$y)
    if ($p.A -gt 150) { $line += ('['+($cx*50)+']'+ (Hex $p.R $p.G $p.B) +' ') }
  }
  Write-Output ('y{0}: {1}' -f $y,$line.Trim())
}
$bmp.Dispose()
