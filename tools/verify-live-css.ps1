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
Write-Output '=== Tokens de layout del campo (src) ==='
$layoutTokens = @(
  @('AR campo 976/560',      '976 / 560'),
  @('ancho campo 100cqw',    '100cqw'),
  @('alto campo 100cqh',     '100cqh'),
  @('factor AR 976/560',     '1.742857'),
  @('tribuna band-x',        '--band-x'),
  @('tribuna band-y',        '--band-y'),
  @('marco flotante header', '--live-header-h'),
  @('marco flotante timeline','--live-timeline-h'),
  @('panel sheet',           '--live-sheet-w'),
  @('trigger rail',          '--live-rail-trigger'),
  @('data-rail-trigger',     'data-rail-trigger'),
  @('data-rail-backdrop',    'data-rail-backdrop'),
  @('aria-modal',            'aria-modal'),
  @('marcador escala cqw',   '2.9cqw'),
  @('variante short',        '@custom-variant short'),
  @('contenedor size',       'container-type: size'),
  @('contenedor inline-size','container-type: inline-size'),
  @('query etiqueta',        '@container (max-width: 760px)'),
  @('data-selected',         'data-selected'),
  @('token drawer width',    '--live-drawer-w'),
  @('token cell height',     '--live-cell-h'),
  @('grilla 3 col',          'grid-cols-3'),
  @('grilla 4 col short',    'short:grid-cols-4'),
  @('dos paneles short',     'short:flex-row'),
  @('data-drawer',           'data-drawer'),
  @('data-drawer-scroll',    'data-drawer-scroll'),
  @('data-drawer-cell',      'data-drawer-cell'),
  @('data-player-card',      'data-player-card'),
  @('data-booking',          'data-booking'),
  @('data-scoreboard',       'data-scoreboard'),
  @('mapeo optionKinds',     'optionKinds'),
  @('util getBookings',      'getBookings')
)
foreach ($t in $layoutTokens) {
  $name = $t[0]; $needle = $t[1]
  Write-Output ('  {0,-24} {1}' -f $name, ($(if ($css -match [regex]::Escape($needle)) { 'OK' } else { 'FALTA' })))
}

Write-Output ''
Write-Output '=== CSS compilado (dist) ==='
$distCssFile = (Get-ChildItem (Join-Path $root 'dist\assets') -Filter '*.css' -File | Select-Object -First 1).FullName
$distCss = Get-Content -Raw $distCssFile
$distTokens = @(
  @('variante short compilada',    '@media (height<=560px)'),
  @('sheet 2 columnas',            'grid-cols-2'),
  @('sheet 4 columnas short',      'grid-cols-4'),
  @('panel sheet compilado',       '--live-sheet-w'),
  @('trigger rail compilado',      '--live-rail-trigger'),
  @('container-type size',         'container-type:size'),
  @('container-type inline-size',  'container-type:inline-size'),
  @('query etiqueta compilada',    '@container (width<=760px)'),
  @('clase player-label',          'player-label'),
  @('campo a sangre 100cqw',       '100cqw'),
  @('tribuna band-x compilada',    '--band-x'),
  @('tribuna band-y compilada',    '--band-y'),
  @('marco header compilado',      '--live-header-h'),
  @('marco timeline compilado',    '--live-timeline-h'),
  @('aspect-ratio 976/560',        'aspect-ratio:976/560'),
  @('drawer width compilado',      '--live-drawer-w'),
  @('cell height compilado',       '--live-cell-h'),
  @('grilla 3 col compilada',      'grid-cols-3'),
  @('clase event-drawer',          'event-drawer'),
  @('drawer short 70vw',           '70vw')
)
foreach ($t in $distTokens) {
  $name = $t[0]; $needle = $t[1]
  Write-Output ('  {0,-28} {1}' -f $name, ($(if ($distCss.Contains($needle)) { 'OK' } else { 'FALTA' })))
}

Write-Output ''
Write-Output '=== Ficheros del feature match-control ==='
Get-ChildItem (Join-Path $root 'src\features\match-control') -Recurse -File |
  ForEach-Object { Write-Output ('  ' + $_.FullName.Substring($root.Length + 1)) }

Write-Output ''
Write-Output '=== Assets generados ==='
Get-ChildItem (Join-Path $root 'src\assets\players'), (Join-Path $root 'src\assets\live') |
  ForEach-Object { Write-Output ('  ' + $_.FullName.Substring($root.Length + 1) + '  ' + $_.Length + ' bytes') }
