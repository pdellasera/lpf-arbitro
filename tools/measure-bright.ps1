# tools/measure-bright.ps1
# Reporta rangos-x "brillantes" (blanco/azul/gris claro) por fila -> posiciones de elementos.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_screem.png'))
$W = $bmp.Width; $H = $bmp.Height

function Bright([int]$r,[int]$g,[int]$b) {
  # blanco / azul / gris claro / cian
  if ($r -gt 170 -and $g -gt 170 -and $b -gt 170) { return $true }
  if ($b -gt 140 -and ($b-$r) -gt 40) { return $true }
  if ($r -gt 130 -and $g -gt 130 -and $b -gt 130 -and [Math]::Abs($r-$g) -lt 40 -and [Math]::Abs($g-$b) -lt 40) { return $true }
  return $false
}

foreach ($y in @(930,950,970,1075,1080,1095,1100,1120,1135,1175,1180,1200,1215,1265,1280,1300,1385,1430,1450,1470,1490,1512,1520,1535,1560,1600,1615,1640)) {
  $ranges=@(); $in=$false; $s=0
  for ($x=60; $x -le 880; $x+=2) {
    $p=$bmp.GetPixel($x,$y)
    $b = Bright $p.R $p.G $p.B
    if ($b -and -not $in){ $in=$true; $s=$x }
    if ((-not $b) -and $in){ $in=$false; $ranges += ('{0}-{1}' -f $s,$x) }
  }
  if ($in){ $ranges += ('{0}-880' -f $s) }
  Write-Output ('y={0}: {1}' -f $y, ($(if($ranges){$ranges -join ', '}else{'-'})))
}
$bmp.Dispose()
