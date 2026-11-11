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

Write-Host "Spawning detached Python AI Backend (Port 8000)..."
Start-Process -FilePath "C:\Users\elhaam shaikh\AppData\Local\Programs\Python\Python311\python.exe" `
    -ArgumentList "C:\Users\elhaam shaikh\Desktop\MANGANEX\backend\run_server.py" `
    -WorkingDirectory "C:\Users\elhaam shaikh\Desktop\MANGANEX\backend" `
    -WindowStyle Hidden

Write-Host "Spawning detached Java Spring Boot Backend (Port 8080)..."
Start-Process -FilePath "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot\bin\java.exe" `
    -ArgumentList "-jar", "C:\Users\elhaam shaikh\Desktop\MANGANEX\java-backend\target\manganex-backend-1.0.0.jar" `
    -WorkingDirectory "C:\Users\elhaam shaikh\Desktop\MANGANEX\java-backend" `
    -WindowStyle Hidden

Write-Host "Spawning detached Vite Frontend (Port 3000)..."
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" `
    -ArgumentList "C:\Users\elhaam shaikh\Desktop\MANGANEX\node_modules\vite\bin\vite.js", "preview", "--host", "0.0.0.0", "--port", "3000" `
    -WorkingDirectory "C:\Users\elhaam shaikh\Desktop\MANGANEX" `
    -WindowStyle Hidden

Write-Host "Waiting 8 seconds for all ports to bind..."
Start-Sleep -Seconds 8

Write-Host "Verifying ports..."
Get-NetTCPConnection -LocalPort 3000, 8000, 8080 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State, OwningProcess

