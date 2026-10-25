$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$appUrl = 'http://127.0.0.1:17842'
function Test-SixStrings {
    try { return (Invoke-RestMethod -Uri "$appUrl/health" -TimeoutSec 2).app -eq 'six-strings' } catch { return $false }
}
if (-not (Test-SixStrings)) {
    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    Start-Process -FilePath $nodePath -ArgumentList 'server.mjs' -WorkingDirectory $appRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $appRoot 'server.log') -RedirectStandardError (Join-Path $appRoot 'server-error.log')
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 250
        if (Test-SixStrings) { $ready = $true; break }
    }
    if (-not $ready) { throw 'Six Strings could not start. See server-error.log in the app folder.' }
}
$edgePath = Join-Path ${env:ProgramFiles(x86)} 'Microsoft/Edge/Application/msedge.exe'
if (Test-Path -LiteralPath $edgePath) {
    Start-Process -FilePath $edgePath -ArgumentList "--app=$appUrl" -WindowStyle Normal
} else {
    Start-Process $appUrl
}
