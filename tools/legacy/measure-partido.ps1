# tools/measure-partido.ps1 — geometría/colores finos del mockup de control de partido.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\partido_screem.png'))
function Lum([int]$r,[int]$g,[int]$b){ [int](($r+$g+$b)/3) }
function Hex($p){ ('#{0:X2}{1:X2}{2:X2}' -f $p.R,$p.G,$p.B) }
function Dump([string]$label,[int]$x0,[int]$y0,[int]$x1,[int]$y1){
  Write-Output ('--- ' + $label + ' ---')
  for($y=$y0;$y -le $y1;$y++){
    $row=''
    for($x=$x0;$x -le $x1;$x++){
      $p=$bmp.GetPixel($x,$y); $L=Lum $p.R $p.G $p.B
      if($L -lt 70){$row+='#'} elseif($L -lt 120){$row+='+'} elseif($L -lt 170){$row+='o'} elseif($L -lt 210){$row+='.'} else {$row+=' '}
    }
    Write-Output $row
  }
  Write-Output ''
}
function Sample([string]$label,[int]$x,[int]$y){
  $p=$bmp.GetPixel($x,$y); Write-Output ($label + ' x' + $x + ' y' + $y + ' = ' + (Hex $p))
}

# Iconos del rail (centros y=178,246,314,382,450,518,586,654) — x 120..175
Dump 'rail Gol'        120 163 175 193
Dump 'rail Tarjeta'    120 231 175 261
Dump 'rail Cambio'     120 299 175 329
Dump 'rail Incidente'  120 367 175 397
Dump 'rail Falta'      120 435 175 465
Dump 'rail TiroLibre'  120 503 175 533
Dump 'rail Esquina'    120 571 175 601
Dump 'rail Mas'        120 639 175 669

# Dos acciones rapidas superiores (x 1036..1148, y 76..124)
Dump 'quick1' 1036 76 1085 124
Dump 'quick2' 1088 76 1148 124
Sample 'quick1 bg' 1050 100
Sample 'quick2 bg' 1118 100

# En vivo (x 1190..1275, y 68..122)
Dump 'envivo' 1190 68 1275 122
Sample 'envivo dot' 1205 95
Sample 'envivo pill' 1222 95

# Rail bg / item inactivo
Sample 'rail bg'       150 216
Sample 'rail gol bg'   150 178
Sample 'rail top edge' 150 136

# Panel drawer
Sample 'drawer bg'     1450 300
Sample 'drawer bg2'    1450 500
Sample 'search bg'     1450 320
Sample 'row bg'        1291 380
Sample 'row num bg'    1310 380
Sample 'chip border'   1474 633
Sample 'chip bg'       1474 640
Sample 'stepper btn'   1310 690
Sample 'cancel btn'    1350 832
Sample 'guardar btn'   1500 832
Sample 'seg bg'        1450 240

# Marcador / timeline
Sample 'pill bg'       345 100
Sample 'timeline bg'   600 780
Sample 'timeline track' 600 827
Sample 'play ring'     84 800
Sample 'tick label'    272 847

# Iconos del timeline (eventos) — mini dumps
Dump 'tl 15'  260 785 284 815
Dump 'tl 30'  398 785 422 815
Dump 'tl 45'  537 785 561 815
Dump 'tl 60'  790 785 814 815
Dump 'tl 72'  931 785 955 815
Dump 'tl 75'  966 785 990 815
Dump 'tl 90' 1142 785 1166 815

$bmp.Dispose()
