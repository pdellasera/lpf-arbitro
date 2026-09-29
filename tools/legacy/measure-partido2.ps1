# tools/measure-partido2.ps1 — muestras de color + iconos superiores (salida compacta).
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
function S([string]$label,[int]$x,[int]$y){ $p=$bmp.GetPixel($x,$y); Write-Output ($label + ' = ' + (Hex $p)) }

Dump 'quick1' 1036 76 1085 124
Dump 'quick2' 1088 76 1148 124
Dump 'envivo' 1190 68 1275 122
Dump 'gear'   1292 78 1330 116

S 'quick1 bg'   1050 100
S 'quick1 line' 1050 92
S 'quick2 bg'   1118 100
S 'envivo dot'  1205 96
S 'envivo text' 1222 96
S 'envivo pill' 1225 82
S 'gear color'  1308 96

S 'rail bg'       150 216
S 'rail itemedge' 150 210
S 'rail top'      150 136
S 'drawer bg'     1450 300
S 'search bg'     1450 320
S 'search icon'   1314 325
S 'row bg'        1291 380
S 'row number'    1310 380
S 'row name'      1410 372
S 'row position'  1410 393
S 'check ring'    1580 380
S 'check fill'    1580 372
S 'chip border'   1474 633
S 'chip bg'       1474 645
S 'chip text'     1490 636
S 'stepper btn'   1310 690
S 'stepper glyph' 1307 690
S 'value 72'      1535 692
S 'cancel btn'    1350 832
S 'cancel text'   1368 832
S 'guardar btn'   1500 832
S 'seg bg'        1450 240
S 'seg active'    1330 240
S 'seg inactive tx' 1530 240
S 'header title'  1460 182
S 'ball icon'     1350 182
S 'x close'       1296 182

S 'pill bg'       345 100
S 'pill border'   345 72
S 'timeline bg'   600 780
S 'timeline track' 600 827
S 'play ring'     84 800
S 'tick label'    272 847
S 'grass dark'    700 250
S 'grass light'   700 240
S 'grass line'    720 682
S 'crowd left'    200 300
S 'marker dark'   150 300

$bmp.Dispose()
