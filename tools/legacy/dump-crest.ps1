# tools/dump-crest.ps1 — dump ASCII de regiones de escudos para inspeccion.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
function Dump([string]$label,[int]$x0,[int]$y0,[int]$x1,[int]$y1) {
  Write-Output ('--- {0} (x{1}..{2} y{3}..{4}) ---' -f $label,$x0,$x1,$y0,$y1)
  for ($y=$y0; $y -le $y1; $y+=2) {
    $row=''
    for ($x=$x0; $x -le $x1; $x+=2) {
      $p=$bmp.GetPixel($x,$y)
      $sat=[int]([Math]::Max($p.R,[Math]::Max($p.G,$p.B)) - [Math]::Min($p.R,[Math]::Min($p.G,$p.B)))
      $L=[int](($p.R+$p.G+$p.B)/3)
      if ($sat -gt 60) { $row+='C' } elseif ($L -lt 90) { $row+='#' } elseif ($L -lt 150) { $row+='+' } elseif ($L -lt 210) { $row+='-' } else { $row+='.' }
    }
    Write-Output ('{0,4} {1}' -f $y,$row)
  }
  Write-Output ''
}
Dump 'CAI (izq card1)' 124 668 224 804
Dump 'Plaza Amador (der card1)' 505 690 600 804
$bmp.Dispose()
