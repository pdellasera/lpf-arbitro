# tools/check-shield.ps1 — analiza la región del recorte del escudo en logo.png.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\logo.png'))

# Región que contiene el shield.webp actual: crop=645:685:155:55
$X0 = 155; $Y0 = 55; $CW = 645; $CH = 685

# bbox contenido (alpha>10, grid 2px) dentro del recorte
$minX = $CW; $maxX = 0; $minY = $CH; $maxY = 0
for ($y = 0; $y -lt $CH; $y += 2) { for ($x = 0; $x -lt $CW; $x += 2) {
  if ($bmp.GetPixel($X0 + $x, $Y0 + $y).A -gt 10) {
    if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
    if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
  }
}}
Write-Output ("crop 645x685  bbox: x {0}..{1} (w={2})  y {3}..{4} (h={5})" -f $minX, $maxX, ($maxX - $minX), $minY, $maxY, ($maxY - $minY))

Write-Output ''
Write-Output '=== ALPHA MAP (25px, #=opaco .=transp ~=semi) ==='
$cols = [int]($CW / 25); $rows = [int]($CH / 25)
for ($ry = 0; $ry -lt $rows; $ry++) {
  $line = ''
  for ($cx = 0; $cx -lt $cols; $cx++) {
    $x = [Math]::Min($cx * 25 + 12, $CW - 1); $y = [Math]::Min($ry * 25 + 12, $CH - 1)
    $a = $bmp.GetPixel($X0 + $x, $Y0 + $y).A
    if ($a -gt 200) { $line += '#' } elseif ($a -gt 40) { $line += '~' } else { $line += '.' }
  }
  Write-Output ('y{0,3} {1}' -f ($Y0 + $ry * 25), $line)
}

Write-Output ''
Write-Output '=== colores borde derecho (x=680..799, cada 20px) ==='
foreach ($y in @(120, 220, 320, 420, 520, 620)) {
  $line = ''
  for ($x = 680; $x -le 799; $x += 20) {
    $p = $bmp.GetPixel($x, $y)
    if ($p.A -gt 100) { $line += ('[{0}]{1:X2}{2:X2}{3:X2} ' -f $x, $p.R, $p.G, $p.B) }
  }
  Write-Output ('y{0}: {1}' -f $y, $line.Trim())
}
$bmp.Dispose()
