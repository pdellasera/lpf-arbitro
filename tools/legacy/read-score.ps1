# tools/read-score.ps1 — imprime regiones como ASCII para leer marcadores/crests.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }

function Dump([int]$x0,[int]$y0,[int]$x1,[int]$y1,[int]$step) {
  for ($y=$y0; $y -le $y1; $y+=$step) {
    $row=''
    for ($x=$x0; $x -le $x1; $x+=$step) {
      $p=$bmp.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
      if ($L -lt 90) { $row+='#' } elseif ($L -lt 150) { $row+='+' } elseif ($L -lt 200) { $row+='-' } else { $row+='.' }
    }
    Write-Output ('{0,4} {1}' -f $y, $row)
  }
}

Write-Output '### CARD1 (equipos, esperado vacio) x400..545 y695..775 ###'
Dump 400 695 545 775 2
Write-Output ''
Write-Output '### CARD2 marcador x400..545 y1040..1085 ###'
Dump 400 1040 545 1085 2
Write-Output ''
Write-Output '### CARD3 marcador x400..545 y1340..1395 ###'
Dump 400 1340 545 1395 2
$bmp.Dispose()
