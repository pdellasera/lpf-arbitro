# tools/measure-home2.ps1 — medición compacta de geometría/colores del Home.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
$W = $bmp.Width; $H = $bmp.Height

function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }
function Sat([int]$r,[int]$g,[int]$b){ [int]([Math]::Max($r,[Math]::Max($g,$b)) - [Math]::Min($r,[Math]::Min($g,$b))) }
function Hex($p){ return ('#{0:X2}{1:X2}{2:X2}' -f $p.R,$p.G,$p.B) }

Write-Output ('dims {0}x{1}' -f $W,$H)

Write-Output '=== bordes de contenido claro por fila (primer/ultimo lum>200) ==='
foreach ($y in @(360,505,560,700,725,760,840,1050,1076,1160,1360,1390,1475,1560,1603)) {
  $L = -1; $R = -1
  for ($x=0; $x -lt $W; $x++) { if ((Lum $bmp.GetPixel($x,$y).R $bmp.GetPixel($x,$y).G $bmp.GetPixel($x,$y).B) -gt 200) { $L = $x; break } }
  for ($x=$W-1; $x -ge 0; $x--) { if ((Lum $bmp.GetPixel($x,$y).R $bmp.GetPixel($x,$y).G $bmp.GetPixel($x,$y).B) -gt 200) { $R = $x; break } }
  Write-Output ('y={0,4}  claro x {1}..{2}  (ancho {3})' -f $y, $L, $R, ($R-$L))
}

Write-Output ''
Write-Output '=== limites de regiones verticales en x=120 (borde interno) ==='
$prev = -1
for ($y=400; $y -lt $H; $y++) {
  $p = $bmp.GetPixel(120,$y); $L = Lum $p.R $p.G $p.B
  if ([Math]::Abs($L-$prev) -gt 22) { Write-Output ('y={0,4} lum={1,3} {2}' -f $y,$L,(Hex $p)); $prev=$L }
}

Write-Output ''
Write-Output '=== limites verticales en x=470 (centro) ==='
$prev = -1
for ($y=440; $y -lt $H; $y++) {
  $p = $bmp.GetPixel(470,$y); $L = Lum $p.R $p.G $p.B
  if ([Math]::Abs($L-$prev) -gt 22) { Write-Output ('y={0,4} lum={1,3} {2}' -f $y,$L,(Hex $p)); $prev=$L }
}

Write-Output ''
Write-Output '=== colores ==='
$pts = @(
 @(132,628,'badge1 verde borde-izq'), @(150,628,'badge1 fondo'), @(230,505,'pill activa fondo'),
 @(262,505,'pill inactiva borde'), @(280,505,'pill inactiva fondo'), @(460,700,'card1 body'),
 @(85,640,'card1 borde izq'), @(120,650,'card1 interior izq'), @(460,1060,'card2 body'),
 @(85,940,'card2 borde izq'), @(120,985,'card2 subheader izq'), @(460,1280,'card3 body'),
 @(85,1260,'card3 borde izq'), @(460,560,'fondo bajo pills'), @(120,90,'hero izq top'),
 @(120,250,'hero izq mid'), @(120,400,'hero izq low'), @(120,440,'hero izq bottom'),
 @(830,250,'hero der mid'), @(830,400,'hero der low'), @(140,1603,'tab label activo'),
 @(300,1603,'tab label inactivo'), @(470,1545,'tab bar borde sup'), @(470,1640,'tab bar fondo'),
 @(460,725,'score card1 zona'), @(460,1044,'score card2 zona'), @(460,1358,'score card3 zona')
)
foreach ($pt in $pts) { $p = $bmp.GetPixel($pt[0],$pt[1]); Write-Output ('{0,-24} ({1,3},{2,4}) {3}' -f $pt[2],$pt[0],$pt[1],(Hex $p)) }

Write-Output ''
Write-Output '=== runs no-blancos en filas de equipos (escudos/marcador) ==='
foreach ($y in @(724,1044,1358)) {
  $runs = @(); $in = $false; $s = 0
  for ($x=0; $x -lt $W; $x++) {
    $p = $bmp.GetPixel($x,$y); $L = Lum $p.R $p.G $p.B; $sat = Sat $p.R $p.G $p.B
    $ink = ($L -lt 205) -or ($sat -gt 45)
    if ($ink -and -not $in) { $in=$true; $s=$x }
    if ((-not $ink) -and $in) { $in=$false; $runs += @(@($s, $x-1)) }
  }
  $str = @($runs | ForEach-Object {
    $x0=$_[0]; $x1=$_[1]
    $r=0;$g=0;$b=0;$n=0
    for ($x=$x0; $x -le $x1; $x+=2) { $p=$bmp.GetPixel($x,$y); $r+=$p.R;$g+=$p.G;$b+=$p.B;$n++ }
    if ($n -eq 0) {$n=1}
    $cr=[int]($r/$n); $cg=[int]($g/$n); $cb=[int]($b/$n)
    ('[{0}..{1} #{2:X2}{3:X2}{4:X2}]' -f $x0,$x1,$cr,$cg,$cb)
  }) -join ' '
  Write-Output ('y={0}: {1}' -f $y, $str)
}
$bmp.Dispose()
