$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$appRoot = $PSScriptRoot
$bitmap = New-Object System.Drawing.Bitmap 128,128
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = 'AntiAlias'
$plum = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(73,50,77))
$wood = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245,206,152))
$g.FillRectangle($plum,0,0,128,128)
$g.TranslateTransform(64,64)
$g.RotateTransform(35)
$g.TranslateTransform(-64,-64)
$g.FillEllipse($wood,32,62,64,48)
$g.FillEllipse($wood,40,51,48,44)
$g.FillRectangle($wood,58,19,12,61)
$g.FillRectangle($wood,54,10,20,27)
$g.FillEllipse($plum,53,72,22,22)
$g.FillRectangle($plum,50,99,28,5)
$icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
$iconPath = Join-Path $appRoot 'public/icon.ico'
$file = [System.IO.File]::Create($iconPath)
$icon.Save($file)
$file.Dispose()
$g.Dispose()
$bitmap.Dispose()
$desktopPath = [Environment]::GetFolderPath('Desktop')
$linkPath = Join-Path $desktopPath 'Six Strings.lnk'
$shell = New-Object -ComObject WScript.Shell
if (Test-Path -LiteralPath $linkPath) {
    $existing = $shell.CreateShortcut($linkPath)
    if ($existing.Arguments -notlike "*$appRoot*") { $linkPath = Join-Path $desktopPath 'Six Strings Guitar.lnk' }
}
$shortcut = $shell.CreateShortcut($linkPath)
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32/wscript.exe'
$shortcut.Arguments = '"' + (Join-Path $appRoot 'Launch Six Strings.vbs') + '"'
$shortcut.WorkingDirectory = $appRoot
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = 'Six Strings - your local guitar lessons and daily practice'
$shortcut.Save()
Write-Output "Desktop launcher created: $linkPath"
