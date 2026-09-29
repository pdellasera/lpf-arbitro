# tools/measure-diff.ps1
# Diferencia login_screem.png (mockup) vs login_background.png (fondo limpio)
# para aislar exactamente la tarjeta, logo y textos sobrepuestos.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$scr = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
$bg  = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_background.png'))
$W = $scr.Width; $H = $scr.Height

# 1) Verificación de alineación en puntos de fondo puro
Write-Output '=== ALINEACION (diff RGB en puntos de fondo) ==='
foreach ($pt in @(@(30,30),@(30,800),@(30,1650),@(900,100),@(900,700),@(900,1600))) {
  $a = $scr.GetPixel($pt[0],$pt[1]); $b = $bg.GetPixel($pt[0],$pt[1])
  $d = [Math]::Max([Math]::Abs($a.R-$b.R),[Math]::Max([Math]::Abs($a.G-$b.G),[Math]::Abs($a.B-$b.B)))
  Write-Output ('({0},{1}) scr=({2},{3},{4}) bg=({5},{6},{7}) diff={8}' -f $pt[0],$pt[1],$a.R,$a.G,$a.B,$b.R,$b.G,$b.B,$d)
}

# 2) Mapa de diferencias (grid ~20px)
$TH = 22
Write-Output ''
Write-Output '=== DIFF MAP (grid ~20px) #=sobrepuesto .=fondo ==='
$cols = [int]($W/20); $rows = [int]($H/20)
for ($ry=0; $ry -lt $rows; $ry++) {
  $line = ''
  for ($cx=0; $cx -lt $cols; $cx++) {
    $x = [Math]::Min($cx*20+10,$W-1); $y = [Math]::Min($ry*20+10,$H-1)
    $a = $scr.GetPixel($x,$y); $b = $bg.GetPixel($x,$y)
    $d = [Math]::Max([Math]::Abs($a.R-$b.R),[Math]::Max([Math]::Abs($a.G-$b.G),[Math]::Abs($a.B-$b.B)))
    $line += $(if ($d -gt $TH) { '#' } else { '.' })
  }
  Write-Output ('{0,3} {1}' -f $ry, $line)
}

# 3) Bounding box global de píxeles cambiados (grid 2px) para el radio de la tarjeta
Write-Output ''
Write-Output '=== BBOX píxeles cambiados (grid 2px, th=22) ==='
$minX=$W; $maxX=0; $minY=$H; $maxY=0
for ($y=0; $y -lt $H; $y+=2) {
  for ($x=0; $x -lt $W; $x+=2) {
    $a = $scr.GetPixel($x,$y); $b = $bg.GetPixel($x,$y)
    $d = [Math]::Max([Math]::Abs($a.R-$b.R),[Math]::Max([Math]::Abs($a.G-$b.G),[Math]::Abs($a.B-$b.B)))
    if ($d -gt $TH) {
      if ($x -lt $minX){$minX=$x}; if ($x -gt $maxX){$maxX=$x}
      if ($y -lt $minY){$minY=$y}; if ($y -gt $maxY){$maxY=$y}
    }
  }
}
Write-Output ('bbox: x {0}..{1} (w={2}), y {3}..{4} (h={5})' -f $minX,$maxX,($maxX-$minX),$minY,$maxY,($maxY-$minY))

$scr.Dispose(); $bg.Dispose()
