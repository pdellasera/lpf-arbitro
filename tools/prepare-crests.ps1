# tools/prepare-crests.ps1 — recorta los 6 escudos del mockup y les aplica alfa (flood-fill).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\home_screem.png'))
$out = Join-Path $root 'src\assets\crests'
New-Item -ItemType Directory -Force -Path $out | Out-Null

function IsContent([System.Drawing.Color]$p) {
  $L = [int](($p.R+$p.G+$p.B)/3)
  $sat = [int]([Math]::Max($p.R,[Math]::Max($p.G,$p.B)) - [Math]::Min($p.R,[Math]::Min($p.G,$p.B)))
  return ($sat -gt 40) -or ($L -lt 90)
}

# ventanas de busqueda: nombre, x0,y0,x1,y1
$crests = @(
  @('cai',            115, 696, 235, 795),
  @('plaza-amador',   490, 696, 605, 795),
  @('tauro',          115, 1000, 235, 1105),
  @('san-francisco',  545, 1000, 660, 1105),
  @('herrera',        115, 1315, 235, 1415),
  @('umecit',         555, 1315, 655, 1415)
)

foreach ($c in $crests) {
  $name=$c[0]; $x0=$c[1]; $y0=$c[2]; $x1=$c[3]; $y1=$c[4]
  # bbox de contenido
  $minX=$x1; $maxX=$x0; $minY=$y1; $maxY=$y0; $n=0
  for ($y=$y0; $y -le $y1; $y++) { for ($x=$x0; $x -le $x1; $x++) {
    if (IsContent $bmp.GetPixel($x,$y)) {
      $n++
      if ($x -lt $minX) {$minX=$x}; if ($x -gt $maxX) {$maxX=$x}
      if ($y -lt $minY) {$minY=$y}; if ($y -gt $maxY) {$maxY=$y}
    }
  }}
  if ($n -lt 20) { Write-Output ("{0}: VACIO (n={1})" -f $name,$n); continue }

  $m = 3
  $minX = [Math]::Max(0, $minX-$m); $maxX = [Math]::Min($bmp.Width-1, $maxX+$m)
  $minY = [Math]::Max(0, $minY-$m); $maxY = [Math]::Min($bmp.Height-1, $maxY+$m)
  $cw = $maxX-$minX+1; $ch = $maxY-$minY+1

  # crop
  $crop = New-Object System.Drawing.Bitmap $cw, $ch, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($crop)
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0,0,$cw,$ch), (New-Object System.Drawing.Rectangle $minX,$minY,$cw,$ch), ([System.Drawing.GraphicsUnit]::Pixel))
  $g.Dispose()

  # color de fondo = promedio de las 4 esquinas
  $corners = @($crop.GetPixel(0,0), $crop.GetPixel($cw-1,0), $crop.GetPixel(0,$ch-1), $crop.GetPixel($cw-1,$ch-1))
  $bR=0;$bG=0;$bB=0; foreach ($p in $corners) { $bR+=$p.R;$bG+=$p.G;$bB+=$p.B }
  $bR=[int]($bR/4); $bG=[int]($bG/4); $bB=[int]($bB/4)
  $tol = 46

  # flood-fill desde los bordes (conectividad 4)
  $vis = New-Object bool[] ($cw*$ch)
  $q = New-Object System.Collections.Generic.Queue[int]
  $script:bR = $bR; $script:bG = $bG; $script:bB = $bB; $script:tol = $tol
  function Fill([int]$nx,[int]$ny) {
    if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $script:cw -or $ny -ge $script:ch) { return }
    $i = $ny * $script:cw + $nx
    if ($script:vis[$i]) { return }
    $pp = $script:crop.GetPixel($nx,$ny)
    $dd = [Math]::Sqrt(($pp.R-$script:bR)*($pp.R-$script:bR)+($pp.G-$script:bG)*($pp.G-$script:bG)+($pp.B-$script:bB)*($pp.B-$script:bB))
    if ($dd -lt $script:tol) { $script:vis[$i] = $true; $script:q.Enqueue($i) }
  }
  $script:vis = $vis; $script:q = $q; $script:crop = $crop; $script:cw = $cw; $script:ch = $ch
  for ($x=0; $x -lt $cw; $x++) { Fill $x 0; Fill $x ($ch-1) }
  for ($y=0; $y -lt $ch; $y++) { Fill 0 $y; Fill ($cw-1) $y }
  while ($q.Count -gt 0) {
    $idx = $q.Dequeue(); $px = $idx % $cw; $py = [int]($idx / $cw)
    $n1 = $px - 1; $n2 = $px + 1; $n3 = $py - 1; $n4 = $py + 1
    Fill $n1 $py; Fill $n2 $py; Fill $px $n3; Fill $px $n4
  }
  # aplicar alfa (fondo -> 0)
  for ($y=0; $y -lt $ch; $y++) { for ($x=0; $x -lt $cw; $x++) {
    if ($vis[$y*$cw+$x]) {
      $pp = $crop.GetPixel($x,$y)
      $crop.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,$pp.R,$pp.G,$pp.B))
    }
  }}

  $png = Join-Path $out ($name + '.png')
  $crop.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
  Write-Output ('{0,-16} bbox x{1}..{2} y{3}..{4} -> {5}x{6} (n={7})' -f $name,$minX,$maxX,$minY,$maxY,$cw,$ch,$n)
}

# convertir a webp lossless
foreach ($c in $crests) {
  $name=$c[0]; $png = Join-Path $out ($name + '.png')
  if (Test-Path $png) {
    & ffmpeg -hide_banner -loglevel error -y -i $png -c:v libwebp -lossless 1 (Join-Path $out ($name + '.webp'))
    Remove-Item $png -Force
  }
}
$bmp.Dispose()
Write-Output '=== escudos generados ==='
Get-ChildItem (Join-Path $out '*.webp') | ForEach-Object { Write-Output ('{0}  {1} bytes' -f $_.Name, $_.Length) }
