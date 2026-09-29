# tools/read-icons.ps1 — dump de iconos como ASCII para identificar formas.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }

function Dump([string]$label,[int]$x0,[int]$y0,[int]$x1,[int]$y1) {
  Write-Output ('--- {0} (x{1}..{2} y{3}..{4}) ---' -f $label,$x0,$x1,$y0,$y1)
  for ($y=$y0; $y -le $y1; $y++) {
    $row=''
    for ($x=$x0; $x -le $x1; $x++) {
      $p=$bmp.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
      if ($L -lt 90) { $row+='#' } elseif ($L -lt 160) { $row+='+' } else { $row+='.' }
    }
    Write-Output $row
  }
  Write-Output ''
}

Dump 'footer icon1 (estadio) card1' 134 826 185 858
Dump 'footer icon2 (arbitro) card1'  438 826 490 858
Dump 'footer icon3 (informe) card1'  648 826 700 858
Dump 'header clock card1'            688 612 745 648
Dump 'tab icon1 (casa)'              104 1544 186 1582
Dump 'tab icon2 (informes)'          264 1544 346 1582
Dump 'tab icon3 (stats)'             424 1544 506 1582
Dump 'tab icon4 (calendario)'        584 1544 666 1582
Dump 'tab icon5 (perfil)'            744 1544 826 1582
$bmp.Dispose()
