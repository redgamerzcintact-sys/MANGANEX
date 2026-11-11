Write-Host "Releasing old ports (3000, 8000, 8080) if in use..."
$ports = @(3000, 8000, 8080)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        $pidsToKill = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pidsToKill) {
            if ($pidToKill -gt 4) {
                Write-Host "Killing old process $pidToKill on port $p..."
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Start-Sleep -Seconds 1

$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$JavaDir = Join-Path $ProjectRoot "java-backend"
$JavaJar = Join-Path $JavaDir "target\manganex-backend-1.0.0.jar"
$ViteBin = Join-Path $ProjectRoot "node_modules\vite\bin\vite.js"

$NodeExe = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
$PythonExe = (Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
$JavaExe = if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) { Join-Path $env:JAVA_HOME "bin\java.exe" } else { (Get-Command java -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1) }

$c1 = "`"$NodeExe`" `"$ViteBin`" preview --host 127.0.0.1 --port 3000"
$c2 = "`"$PythonExe`" `"$(Join-Path $BackendDir 'run_server.py')`""
$c3 = "`"$JavaExe`" -jar `"$JavaJar`""

Write-Host "Launching Vite Frontend (Port 3000)..."
$p1 = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $c1; CurrentDirectory = $ProjectRoot }
Write-Host "Vite Return: $($p1.ReturnValue), PID: $($p1.ProcessId)"

Write-Host "Launching Python AI Backend (Port 8000)..."
$p2 = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $c2; CurrentDirectory = $BackendDir }
Write-Host "Python Return: $($p2.ReturnValue), PID: $($p2.ProcessId)"

if (Test-Path $JavaJar) {
    Write-Host "Launching Java Spring Boot Backend (Port 8080)..."
    $p3 = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $c3; CurrentDirectory = $JavaDir }
    Write-Host "Java Return: $($p3.ReturnValue), PID: $($p3.ProcessId)"
} else {
    Write-Host "Skipping Java Spring Boot Backend (JAR not built at $JavaJar)."
}

Write-Host "Waiting 8 seconds for all services to bind..."
Start-Sleep -Seconds 8

Write-Host "=== Active Listeners ==="
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000, 8000, 8080 } | Select-Object LocalAddress, LocalPort, OwningProcess
