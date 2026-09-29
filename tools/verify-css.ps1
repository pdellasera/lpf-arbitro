# tools/verify-css.ps1 — comprueba que el CSS compilado contiene lo esperado.
$file = (Get-ChildItem 'dist\assets\index-*.css' | Select-Object -First 1).FullName
$css = Get-Content -Raw $file
Write-Output ("FILE: " + $file)
$checks = @(
  'app-h',
  'safe-y',
  '100dvh',
  'pointer:fine',
  'pointer: fine',
  'min-width:64rem',
  'min-width: 64rem',
  'coarse',
  'lg\:pointer-fine\:hidden',
  'lg\:pointer-fine\:block',
  'blur-sm',
  'scale-110'
)
foreach ($p in $checks) {
  Write-Output ("{0,-26} {1}" -f $p, $css.Contains($p))
}
