$ports = @(3000, 8000, 8080)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        $pidsToKill = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pidsToKill) {
            if ($pidToKill -gt 4) {
                Write-Host "Releasing port $p from PID $pidToKill..."
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

$PythonExe = (Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
$JavaExe = if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) { Join-Path $env:JAVA_HOME "bin\java.exe" } else { (Get-Command java -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1) }

Write-Host "Spawning detached Python AI Backend (Port 8000)..."
Start-Process -FilePath $PythonExe `
    -ArgumentList "`"$(Join-Path $BackendDir 'run_server.py')`"" `
    -WorkingDirectory $BackendDir `
    -WindowStyle Hidden

if (Test-Path $JavaJar) {
    Write-Host "Spawning detached Java Spring Boot Backend (Port 8080)..."
    Start-Process -FilePath $JavaExe `
        -ArgumentList "-jar", "`"$JavaJar`"" `
        -WorkingDirectory $JavaDir `
        -WindowStyle Hidden
} else {
    Write-Host "Skipping Java Spring Boot Backend (JAR not found at $JavaJar)."
}

Write-Host "Spawning detached Vite Frontend (Port 3000)..."
Start-Process -FilePath $NodeExe `
    -ArgumentList "`"$ViteBin`"", "preview", "--host", "127.0.0.1", "--port", "3000" `
    -WorkingDirectory $ProjectRoot `
    -WindowStyle Hidden

Write-Host "Waiting 8 seconds for all ports to bind..."
Start-Sleep -Seconds 8

Write-Host "Verifying ports..."
Get-NetTCPConnection -LocalPort 3000, 8000, 8080 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State, OwningProcess

