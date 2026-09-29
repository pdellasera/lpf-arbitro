# tools/ocr-home.ps1
# Extrae el texto del mockup Home usando OCR de Windows (WinRT) con sus coordenadas.
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\ocr-home.ps1 [archivo]
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await($AsyncTask, $ResultType) {
  $asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]
  $task = $asTask.MakeGenericMethod($ResultType).Invoke($null, @($AsyncTask))
  $task.Wait()
  $task.Result
}

# Proyecciones WinRT
[Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.RandomAccessStream, Windows.Storage.Streams, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language, Windows.Globalization, ContentType=WindowsRuntime] | Out-Null

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$img  = Join-Path $root 'assets\home_screem.png'
if ($args.Count -gt 0) {
  if ([System.IO.Path]::IsPathRooted($args[0])) { $img = $args[0] }
  else { $img = Join-Path $root $args[0] }
}

$file    = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($img)) ([Windows.Storage.StorageFile])
$stream  = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap  = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

# OcrEngine requiere Gray8/Bgra8 (PNG puede venir Rgba8 -> convertir)
if ($bitmap.BitmapPixelFormat -ne [Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8) {
  $bitmap = [Windows.Graphics.Imaging.SoftwareBitmap]::Convert($bitmap, [Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8)
}

$lang   = New-Object Windows.Globalization.Language 'es-MX'
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }
if (-not $engine) { throw 'No hay motor OCR disponible' }
Write-Output ("OCRF language: {0}" -f $engine.RecognizerLanguage.LanguageTag)

$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

Write-Output '=== LINEAS ==='
foreach ($line in $result.Lines) {
  $words = @($line.Words)
  $y0 = ($words | ForEach-Object { $_.BoundingRect.Y } | Measure-Object -Minimum).Minimum
  $txt = ($words | ForEach-Object { $_.Text }) -join ' '
  Write-Output ("y={0,4}  '{1}'" -f $y0, $txt)
}

Write-Output ''
Write-Output '=== PALABRAS (x,y,w,h) ==='
foreach ($line in $result.Lines) {
  foreach ($w in $line.Words) {
    $r = $w.BoundingRect
    Write-Output ("{0,4} {1,4}  {2,3}x{3,-3}  '{4}'" -f $r.X, $r.Y, $r.Width, $r.Height, $w.Text)
  }
}
