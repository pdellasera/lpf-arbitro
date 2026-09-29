# tools/extract-css.ps1 — muestra el contexto alrededor de una cadena del CSS compilado.
param([string]$needle = 'pointer:fine')
$file = (Get-ChildItem 'dist\assets\index-*.css' | Select-Object -First 1).FullName
$css = Get-Content -Raw $file
$idx = $css.IndexOf($needle)
if ($idx -lt 0) { Write-Output "NO ENCONTRADO: $needle"; exit 1 }
$start = [Math]::Max(0, $idx - 160)
$len = [Math]::Min(360, $css.Length - $start)
Write-Output $css.Substring($start, $len)
