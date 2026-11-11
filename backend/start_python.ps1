Set-Location $PSScriptRoot
$LogDir = Join-Path (Split-Path $PSScriptRoot -Parent) "server_logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
python run_server.py > (Join-Path $LogDir "python_startup.log") 2>&1
