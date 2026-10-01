# tools/prepare-crests.ps1 — genera los escudos de clubes en src/assets/crests a partir de assets/.
# Fuentes de alta resolución en assets/:
#   - Transparentes (WebP con canal alfa): CDU, HerreraFC, TauroFC, VeraguasUD, sanfrancisco, "arabe unido logo.webp"
#   - Fondo blanco (PNG): SportingSM.png -> se le aplica flood-fill blanco->alfa.
# Los escudos sin original (cai, plaza-amador, umecit) ya viven en src/assets/crests y no se tocan.
# Requiere ffmpeg en el PATH. Proceso: decodificar -> alfa -> recortar bbox -> escalar (lado mayor 256) -> WebP lossless.
param([string[]]$Names = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root 'assets'
$out  = Join-Path $root 'src\assets\crests'
$tmp  = Join-Path ([System.IO.Path]::GetTempPath()) 'lpf-crests'
New-Item -ItemType Directory -Force -Path $out | Out-Null
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

# nombre de salida -> archivo fuente en assets/
$clubs = @(
  @('cdu',           'CDU'),
  @('sporting',      'SportingSM.png'),
  @('tauro',         'TauroFC.png'),
  @('san-francisco', 'sanfrancisco'),
  @('herrera',       'HerreraFC'),
  @('veraguas',      'VeraguasUD'),
  @('arabe-unido',   'arabe unido logo.webp')
)
if ($Names.Count -gt 0) {
  $filtered = @()
  foreach ($c in $clubs) { if ($Names -contains $c[0]) { $filtered += ,$c } }
  $clubs = $filtered
}

# Decodifica cualquier fuente (webp/png) a un PNG temporal con ffmpeg.
function Get-Decoded([string]$path) {
  $outPng = Join-Path $tmp ([System.IO.Path]::GetRandomFileName() + '.png')
  & ffmpeg -hide_banner -loglevel error -y -i $path $outPng
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg no pudo decodificar $path" }
  return $outPng
}

# Flood-fill: convierte el fondo (color de las esquinas) en transparente.
function Convert-BackgroundToAlpha([System.Drawing.Bitmap]$bmp) {
  $w = $bmp.Width; $h = $bmp.Height
  $bR=0; $bG=0; $bB=0
  $corners = @($bmp.GetPixel(0,0), $bmp.GetPixel($w-1,0), $bmp.GetPixel(0,$h-1), $bmp.GetPixel($w-1,$h-1))
  foreach ($p in $corners) { $bR+=$p.R; $bG+=$p.G; $bB+=$p.B }
  $bR=[int]($bR/4); $bG=[int]($bG/4); $bB=[int]($bB/4)
  $tol = 46
  $vis = New-Object bool[] ($w*$h)
  $q = New-Object 'System.Collections.Generic.Queue[int]'
  $script:bR=$bR; $script:bG=$bG; $script:bB=$bB; $script:tol=$tol
  $script:vis=$vis; $script:q=$q; $script:w=$w; $script:h=$h; $script:bmp=$bmp
  function Fill([int]$nx,[int]$ny) {
    if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $script:w -or $ny -ge $script:h) { return }
    $i = $ny * $script:w + $nx
    if ($script:vis[$i]) { return }
    $pp = $script:bmp.GetPixel($nx,$ny)
    $dd = [Math]::Sqrt(($pp.R-$script:bR)*($pp.R-$script:bR)+($pp.G-$script:bG)*($pp.G-$script:bG)+($pp.B-$script:bB)*($pp.B-$script:bB))
    if ($dd -lt $script:tol) { $script:vis[$i]=$true; $script:q.Enqueue($i) }
  }
  for ($x=0; $x -lt $w; $x++) { Fill $x 0; Fill $x ($h-1) }
  for ($y=0; $y -lt $h; $y++) { Fill 0 $y; Fill ($w-1) $y }
  while ($q.Count -gt 0) {
    $idx=$q.Dequeue(); $px=$idx % $w; $py=[int]($idx/$w)
    Fill ($px-1) $py; Fill ($px+1) $py; Fill $px ($py-1); Fill $px ($py+1)
  }
  for ($y=0; $y -lt $h; $y++) { for ($x=0; $x -lt $w; $x++) {
    if ($vis[$y*$w+$x]) {
      $pp=$bmp.GetPixel($x,$y)
      $bmp.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,$pp.R,$pp.G,$pp.B))
    }
  }}
}

foreach ($c in $clubs) {
  $name=$c[0]; $file=$c[1]
  $path = Join-Path $src $file
  if (-not (Test-Path $path)) { throw "Falta la fuente: $path" }

  $decoded = Get-Decoded $path
  $bmp = [System.Drawing.Bitmap]::FromFile($decoded)

  # asegurar canal alfa: si la fuente es un PNG con fondo blanco (sin alfa), se lo quitamos.
  $pf = $bmp.PixelFormat
  $hasAlpha = ($pf -eq [System.Drawing.Imaging.PixelFormat]::Format32bppArgb) -or ($pf -eq [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
  if (-not $hasAlpha) {
    $argb = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($argb)
    $g.DrawImage($bmp, 0, 0, $bmp.Width, $bmp.Height)
    $g.Dispose()
    $bmp.Dispose()
    $bmp = $argb
    Convert-BackgroundToAlpha $bmp
  }

  # bbox del contenido usando el canal alfa
  $w=$bmp.Width; $h=$bmp.Height
  $minX=$w; $maxX=-1; $minY=$h; $maxY=-1; $n=0
  for ($y=0; $y -lt $h; $y++) { for ($x=0; $x -lt $w; $x++) {
    if ($bmp.GetPixel($x,$y).A -gt 8) {
      $n++
      if ($x -lt $minX){$minX=$x}; if ($x -gt $maxX){$maxX=$x}
      if ($y -lt $minY){$minY=$y}; if ($y -gt $maxY){$maxY=$y}
    }
  }}
  if ($n -lt 20) { Write-Output ("{0}: VACIO (n={1})" -f $name,$n); $bmp.Dispose(); continue }

  $m=3
  $minX=[Math]::Max(0,$minX-$m); $maxX=[Math]::Min($w-1,$maxX+$m)
  $minY=[Math]::Max(0,$minY-$m); $maxY=[Math]::Min($h-1,$maxY+$m)
  $cw=$maxX-$minX+1; $ch=$maxY-$minY+1

  $scale = 256.0 / [Math]::Max($cw, $ch)
  if ($scale -gt 1.0) { $scale = 1.0 }
  $tw=[Math]::Max(1,[int][Math]::Round($cw*$scale))
  $th=[Math]::Max(1,[int][Math]::Round($ch*$scale))

  $final = New-Object System.Drawing.Bitmap $tw, $th, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g2 = [System.Drawing.Graphics]::FromImage($final)
  $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g2.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0,0,$tw,$th), (New-Object System.Drawing.Rectangle $minX,$minY,$cw,$ch), ([System.Drawing.GraphicsUnit]::Pixel))
  $g2.Dispose()
  $bmp.Dispose()

  $pngOut = Join-Path $tmp ($name + '.png')
  $final.Save($pngOut, [System.Drawing.Imaging.ImageFormat]::Png)
  $final.Dispose()

  $webpOut = Join-Path $out ($name + '.webp')
  & ffmpeg -hide_banner -loglevel error -y -i $pngOut -c:v libwebp -lossless 1 $webpOut
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg no pudo exportar $webpOut" }
  Remove-Item $pngOut -Force

  Write-Output ('{0,-16} {1,-22} -> {2}x{3} (n={4})' -f $name, $file, $tw, $th, $n)
}

Write-Output '=== escudos generados ==='
Get-ChildItem (Join-Path $out '*.webp') | Sort-Object Name | ForEach-Object { Write-Output ('{0,-20} {1,8} bytes' -f $_.Name, $_.Length) }
