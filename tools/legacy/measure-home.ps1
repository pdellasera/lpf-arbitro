# tools/measure-home.ps1
# Mide el mockup Home (home_screem.png) por análisis de píxeles.
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\measure-home.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp  = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
$W = $bmp.Width; $H = $bmp.Height
Write-Output ("dims: {0} x {1}" -f $W, $H)

function Lum([int]$r,[int]$g,[int]$b){ return [int](($r+$g+$b)/3) }
function Classify([int]$r,[int]$g,[int]$b) {
  $lum = Lum $r $g $b
  if ($b -gt ($r+50) -and $b -gt ($g+30) -and $b -gt 110) { return 'B' }   # azul brillante
  if ($g -gt ($r+40) -and $g -gt ($b+40) -and $g -gt 100) { return 'G' }   # verde
  if ($lum -gt 245) { return 'W' }
  if ($lum -gt 225) { return 'w' }
  if ($lum -gt 175) { return '.' }
  if ($lum -gt 120) { return '+' }
  if ($lum -gt 60)  { return '=' }
  if ($lum -gt 30)  { return ':' }
  return '#'
}

Write-Output '=== ESQUINAS / MARGEN (¿hay marco o es full-bleed?) ==='
foreach ($pt in @(@(0,0), @(470,0), @(940,0), @(0,836), @(940,836), @(0,1671), @(470,1671), @(940,1671), @(20,20), @(920,1650))) {
  $p = $bmp.GetPixel($pt[0], $pt[1])
  Write-Output ("({0,4},{1,4}) RGB=({2,3},{3,3},{4,3})" -f $pt[0], $pt[1], $p.R, $p.G, $p.B)
}

Write-Output ''
Write-Output '=== MAPA (grid 20px) ==='
$cols = [int]($W/20); $rows = [int]($H/20)
for ($ry=0; $ry -lt $rows; $ry++) {
  $line = ''
  for ($cx=0; $cx -lt $cols; $cx++) {
    $x = [Math]::Min($cx*20+10, $W-1); $y = [Math]::Min($ry*20+10, $H-1)
    $p = $bmp.GetPixel($x,$y)
    $line += (Classify $p.R $p.G $p.B)
  }
  Write-Output ('{0,3} {1}' -f $ry, $line)
}

Write-Output ''
Write-Output '=== TRANSICIONES verticales (luminancia) x=470 centro ==='
$prev = -1
for ($y=0; $y -lt $H; $y++) {
  $p = $bmp.GetPixel(470,$y); $L = Lum $p.R $p.G $p.B
  if ([Math]::Abs($L - $prev) -gt 18) {
    Write-Output ('y={0,4}: lum {1,3}  RGB=({2,3},{3,3},{4,3})' -f $y,$L,$p.R,$p.G,$p.B)
    $prev = $L
  }
}

Write-Output ''
Write-Output '=== TRANSICIONES horizontales y=500 (pills) y=725 (equipos card1) ==='
foreach ($yy in @(500, 725, 1050, 1360)) {
  $prev = -1
  $line = ''
  for ($x=0; $x -lt $W; $x++) {
    $p = $bmp.GetPixel($x,$yy); $L = Lum $p.R $p.G $p.B
    if ([Math]::Abs($L - $prev) -gt 18) {
      $line += (' x{0}={1}' -f $x,$L)
      $prev = $L
    }
  }
  Write-Output ('y={0}:{1}' -f $yy, $line)
}

Write-Output ''
Write-Output '=== MUESTREO DE COLORES clave ==='
function Probar([int]$x,[int]$y,[string]$label) {
  $p = $bmp.GetPixel($x,$y)
  Write-Output ("{0,-26} ({1,4},{2,4})  #{3:X2}{4:X2}{5:X2}" -f $label,$x,$y,$p.R,$p.G,$p.B)
}
Probar 470 80  'hero top (foto)'
Probar 470 340 'hero bajo titulo'
Probar 470 460 'hoja (fondo)'
Probar 470 500 'pill activa fondo'
Probar 470 528 'pill activa texto zona'
Probar 200 500 'pill inactiva fondo'
Probar 470 650 'card1 subheader (lig)'
Probar 470 700 'card1 body'
Probar 140 726 'card1 equipo CAI texto'
Probar 470 900 'card1 divisor'
Probar 470 620 'card1 badge verde'
Probar 470 945 'card2 badge verde'
Probar 470 1260 'card3 badge gris'
Probar 470 1560 'tab bar iconos'
Probar 470 1603 'tab bar labels'
Probar 90 620 'card1 borde izquierdo'
Probar 90 700 'card1 interior izq'

$bmp.Dispose()
