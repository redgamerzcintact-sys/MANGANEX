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

$c1 = '"C:\Program Files\nodejs\node.exe" "C:\Users\elhaam shaikh\Desktop\MANGANEX\node_modules\vite\bin\vite.js" preview --host 0.0.0.0 --port 3000'
$c2 = '"C:\Users\elhaam shaikh\AppData\Local\Programs\Python\Python311\python.exe" "C:\Users\elhaam shaikh\Desktop\MANGANEX\backend\run_server.py"'
$c3 = '"C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot\bin\java.exe" -jar "C:\Users\elhaam shaikh\Desktop\MANGANEX\java-backend\target\manganex-backend-1.0.0.jar"'

Write-Host "Launching Vite Frontend (Port 3000)..."
$p1 = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $c1; CurrentDirectory = 'C:\Users\elhaam shaikh\Desktop\MANGANEX' }
Write-Host "Vite Return: $($p1.ReturnValue), PID: $($p1.ProcessId)"

Write-Host "Launching Python AI Backend (Port 8000)..."
$p2 = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $c2; CurrentDirectory = 'C:\Users\elhaam shaikh\Desktop\MANGANEX\backend' }
Write-Host "Python Return: $($p2.ReturnValue), PID: $($p2.ProcessId)"

Write-Host "Launching Java Spring Boot Backend (Port 8080)..."
$p3 = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $c3; CurrentDirectory = 'C:\Users\elhaam shaikh\Desktop\MANGANEX\java-backend' }
Write-Host "Java Return: $($p3.ReturnValue), PID: $($p3.ProcessId)"

Write-Host "Waiting 8 seconds for all services to bind..."
Start-Sleep -Seconds 8

Write-Host "=== Active Listeners ==="
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000, 8000, 8080 } | Select-Object LocalAddress, LocalPort, OwningProcess
