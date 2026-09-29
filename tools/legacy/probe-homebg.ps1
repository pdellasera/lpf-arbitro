# tools/probe-homebg.ps1 — qué contiene home_background.png y si coincide con el hero del mockup.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$a = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_background.png'))
$b = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
Write-Output ('home_background dims: {0}x{1}' -f $a.Width, $a.Height)
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }

Write-Output '=== muestras home_background (regiones hero) ==='
$pts = @(@(470,340,'camiseta verde'), @(120,90,'izq top'), @(470,80,'centro top'), @(200,380,'zona titulo'), @(470,430,'bajo hero'), @(830,250,'der mid'), @(470,200,'centro mid'), @(120,250,'izq mid'))
foreach ($pt in $pts) {
  $p=$a.GetPixel($pt[0],$pt[1])
  Write-Output ('{0,-16} ({1,3},{2,3}) #{3:X2}{4:X2}{5:X2}' -f $pt[2],$pt[0],$pt[1],$p.R,$p.G,$p.B)
}

Write-Output ''
Write-Output '=== diff home_background vs home_screem (hero, cada 8px) ==='
$diff=0; $same=0; $n=0
for ($y=0; $y -le 467; $y+=8) {
  for ($x=0; $x -lt $a.Width; $x+=8) {
    $pa=$a.GetPixel($x,$y); $pb=$b.GetPixel($x,$y); $n++
    $d=[Math]::Abs($pa.R-$pb.R)+[Math]::Abs($pa.G-$pb.G)+[Math]::Abs($pa.B-$pb.B)
    if ($d -gt 30) { $diff++ } else { $same++ }
  }
}
Write-Output ('hero: iguales={0}  distintos={1}  (de {2})' -f $same,$diff,$n)

Write-Output ''
Write-Output '=== diff home_background vs login_background (toda, cada 8px) ==='
$c = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\login_background.png'))
$diff=0; $same=0; $n=0
for ($y=0; $y -lt $a.Height; $y+=8) {
  for ($x=0; $x -lt $a.Width; $x+=8) {
    $pa=$a.GetPixel($x,$y); $pc=$c.GetPixel($x,$y); $n++
    $d=[Math]::Abs($pa.R-$pc.R)+[Math]::Abs($pa.G-$pc.G)+[Math]::Abs($pa.B-$pc.B)
    if ($d -gt 30) { $diff++ } else { $same++ }
  }
}
Write-Output ('vs login: iguales={0}  distintos={1}  (de {2})' -f $same,$diff,$n)
$a.Dispose(); $b.Dispose(); $c.Dispose()
