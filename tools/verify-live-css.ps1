# tools/verify-live-css.ps1 — audita que los tokens/medidas del control de partido están cableados.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

$tokens = @(
  @('brand/activo',  '#0060fd'),
  @('panel drawer',  '#001222'),
  @('timeline bg',   '#071423'),
  @('timeline track','#607793'),
  @('rail bg',       '#0f2135'),
  @('grass a',       '#3d6e11'),
  @('grass b',       '#56872a'),
  @('en vivo',       '#2fe07b'),
  @('foco rojo',     '#c80313'),
  @('tarjeta',       '#dcb90a'),
  @('cambio',        '#00c258'),
  @('incidente',     '#6c1be7')
)

Write-Output '=== Tokens cableados en src (cualquier fichero) ==='
$css = (Get-ChildItem (Join-Path $root 'src') -Recurse -Include *.tsx,*.ts,*.css -File | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n"
foreach ($t in $tokens) {
  $name = $t[0]; $hex = $t[1]
  Write-Output ('  {0,-16} {1}' -f $name, ($(if ($css -match [regex]::Escape($hex)) { 'OK' } else { 'FALTA' })))
}

Write-Output ''
Write-Output '=== Ficheros del feature match-control ==='
Get-ChildItem (Join-Path $root 'src\features\match-control') -Recurse -File |
  ForEach-Object { Write-Output ('  ' + $_.FullName.Substring($root.Length + 1)) }

Write-Output ''
Write-Output '=== Assets generados ==='
Get-ChildItem (Join-Path $root 'src\assets\players'), (Join-Path $root 'src\assets\live') |
  ForEach-Object { Write-Output ('  ' + $_.FullName.Substring($root.Length + 1) + '  ' + $_.Length + ' bytes') }
