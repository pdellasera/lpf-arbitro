# tools/measure-design2.ps1
# Mapa hex + escaneos de transición para reconstruir la geometría del mockup.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bmp  = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
$W = $bmp.Width; $H = $bmp.Height

function Hex([int]$r,[int]$g,[int]$b) { return ('{0:X2}{1:X2}{2:X2}' -f $r,$g,$b) }

Write-Output '=== HEX MAP (grid 60px: 16 cols x 28 rows) ==='
$cols = [int]($W/60); $rows = [int]($H/60)
for ($ry=0; $ry -lt $rows; $ry++) {
  $line = ''
  for ($cx=0; $cx -lt $cols; $cx++) {
    $x = [Math]::Min($cx*60+30, $W-1); $y = [Math]::Min($ry*60+30, $H-1)
    $p = $bmp.GetPixel($x,$y)
    $line += (Hex $p.R $p.G $p.B) + ' '
  }
  Write-Output ('y{0,3} {1}' -f ($ry*60), $line.Trim())
}

Write-Output ''
Write-Output '=== HORIZONTAL transitions (left->right), by y ==='
foreach ($y in @(80,200,350,460,560,650,740,830,920,1000,1080,1160,1240,1320,1400,1500,1580,1650)) {
  $prev = ''
  $out = ("y=" + $y + "  ")
  for ($x=0; $x -lt $W; $x++) {
    $p = $bmp.GetPixel($x,$y); $h = Hex $p.R $p.G $p.B
    if ($h -ne $prev) {
      $out += ("[{0}] {1} " -f $x, $h)
      $prev = $h
    }
  }
  Write-Output $out
}
