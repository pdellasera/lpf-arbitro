# tools/measure-design.ps1
# Mide el mockup login_screem.png por análisis de píxeles (sin ver la imagen).
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\measure-design.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bmp  = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
$W = $bmp.Width; $H = $bmp.Height
Write-Output ("dims: {0} x {1}" -f $W, $H)

function Classify([int]$r,[int]$g,[int]$b) {
  if ($g -gt 150 -and $r -lt 210 -and $b -lt 160) { return 'G' }   # fondo verde top
  if ($b -gt 140 -and $r -lt 90  -and $g -lt 130) { return 'B' }   # fondo azul bottom
  if ($r -gt 200 -and $g -gt 200 -and $b -gt 200) { return 'W' }   # blanco (texto)
  if ($r -lt 60  -and $g -lt 80  -and $b -lt 120) { return '#' }   # navy oscuro
  if ($r -lt 95  -and $g -lt 125 -and $b -lt 160) { return ':' }   # navy claro (inputs)
  if ($b -gt 180 -and ($b - $r) -gt 80  -and $b -gt $g) { return 'b' }  # azul brillante
  if ($r -gt 90  -and ($r - $g) -gt 70  -and $g -lt 110 -and $b -lt 120) { return 'R' } # rojo
  if ($r -gt 170 -and $g -gt 110 -and $b -lt 100) { return 'Y' }   # amarillo/naranja
  return '?'
}

Write-Output '=== ASCII MAP (grid ~20px) ==='
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
Write-Output '=== TRANSICIONES verticales columna x=470 (centro) ==='
$prev = ''
for ($y=0; $y -lt $H; $y++) {
  $p = $bmp.GetPixel(470,$y); $c = Classify $p.R $p.G $p.B
  if ($c -ne $prev) {
    Write-Output ('y={0,4}: {1} -> {2}  RGB=({3},{4},{5})' -f $y,$prev,$c,$p.R,$p.G,$p.B)
    $prev = $c
  }
}
