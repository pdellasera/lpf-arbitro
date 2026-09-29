# tools/measure-home4.ps1 — bordes exactos, radios, estructura de card1, status bar.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
$W=$bmp.Width; $H=$bmp.Height
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }
function Hex($p){ ('#{0:X2}{1:X2}{2:X2}' -f $p.R,$p.G,$p.B) }

Write-Output '=== transicion exacta pantalla (blanco) en y=700 ==='
for ($x=55; $x -le 92; $x++) { Write-Output ('  x{0}={1}' -f $x,(Hex $bmp.GetPixel($x,700))) }
Write-Output '-- derecha --'
for ($x=868; $x -le 905; $x++) { Write-Output ('  x{0}={1}' -f $x,(Hex $bmp.GetPixel($x,700))) }

Write-Output ''
Write-Output '=== perfil vertical x=120 (cada 6px) y=560..1560 ==='
$line=''
for ($y=560; $y -le 1560; $y+=6) { $line += ('{0}:{1} ' -f $y,(Hex $bmp.GetPixel(120,$y))) }
Write-Output $line

Write-Output ''
Write-Output '=== perfil vertical x=470 (cada 6px) y=560..1560 ==='
$line=''
for ($y=560; $y -le 1560; $y+=6) { $line += ('{0}:{1} ' -f $y,(Hex $bmp.GetPixel(470,$y))) }
Write-Output $line

Write-Output ''
Write-Output '=== esquina card1 (mapa 3px, x=80..160 y=600..680) ==='
for ($y=600; $y -le 680; $y+=3) {
  $row=''
  for ($x=80; $x -le 160; $x+=3) {
    $p=$bmp.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
    if ($L -gt 245) { $row+='.' } elseif ($L -gt 225) { $row+=',' } elseif ($L -gt 150) { $row+='+' } elseif ($L -gt 80) { $row+='B' } else { $row+='#' }
  }
  Write-Output ('y{0} {1}' -f $y,$row)
}

Write-Output ''
Write-Output '=== status bar: perfil y=60..100 x=0..941 (runs) ==='
foreach ($y in @(60,70,80,90)) {
  $str=''
  for ($x=0; $x -lt $W; $x++) {
    $p=$bmp.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
    if ($L -gt 200) { $str += ('{0} ' -f $x) }
  }
  Write-Output ('y{0} claro: {1}' -f $y,$str.Trim())
}
$bmp.Dispose()
