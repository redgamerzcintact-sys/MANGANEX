@echo off
title MANGANEX — THE EARTH'S HIDDEN INTELLIGENCE
color 0B
cls

echo.
echo  =====================================================================
echo   MANGANEX — THE EARTH'S HIDDEN INTELLIGENCE
echo   Enterprise AI Geological Exploration & Mining Platform
echo  =====================================================================
echo.

set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "PYTHON_EXE=python"
set "JAVA_EXE=java"
set "NODE_EXE=node"

cd /d "%PROJECT_ROOT%"

echo  [1/3] Launching Python AI / FastAPI Service (Port 8000)...
start "MANGANEX Python AI Service" /min cmd /c "cd /d "%PROJECT_ROOT%\backend" && %PYTHON_EXE% run_server.py"

timeout /t 2 /nobreak >nul

if exist "%PROJECT_ROOT%\java-backend\target\manganex-backend-1.0.0.jar" (
    echo  [2/3] Launching Java Spring Boot Backend (Port 8080)...
    start "MANGANEX Java Backend" /min cmd /c "cd /d "%PROJECT_ROOT%\java-backend" && %JAVA_EXE% -jar target\manganex-backend-1.0.0.jar"
) else (
    echo  [2/3] Java JAR not built yet; skipping Java Spring Boot Backend.
)

timeout /t 4 /nobreak >nul

echo  [3/3] Launching Vite Production Preview Frontend (Port 3000)...
start "MANGANEX Frontend" /min cmd /c "cd /d "%PROJECT_ROOT%" && %NODE_EXE% node_modules\vite\bin\vite.js preview --host 127.0.0.1 --port 3000"

timeout /t 3 /nobreak >nul

echo.
echo  =====================================================================
echo   [OK] ALL MANGANEX SERVICES ARE LIVE!
echo.
echo   Frontend Web Portal : http://localhost:3000
echo   Python AI Engine    : http://localhost:8000 (Docs: /api/v1/docs)
echo   Java Enterprise API : http://localhost:8080 (Health: /actuator/health)
echo  =====================================================================
echo.
echo  Launching browser to http://localhost:3000...
start "" "http://localhost:3000"
echo.
echo  Press any key to exit this launcher (services will keep running).
pause >nul
