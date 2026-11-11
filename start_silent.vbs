Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim root
root = fso.GetParentFolderName(WScript.ScriptFullName)

' Ensure log directory exists
Dim logDir
logDir = root & "\server_logs"
If Not fso.FolderExists(logDir) Then
    fso.CreateFolder(logDir)
End If

' ── 1. Python AI Service (Port 8000) ──────────────────────────────────────
WshShell.Run "cmd /c cd /d """ & root & "\backend"" && python run_server.py > """ & logDir & "\python.log"" 2>&1", 0, False
WScript.Sleep 3000

' ── 2. Java Spring Boot Backend (Port 8080) ───────────────────────────────
If fso.FileExists(root & "\java-backend\target\manganex-backend-1.0.0.jar") Then
    WshShell.Run "cmd /c cd /d """ & root & "\java-backend"" && java -jar target\manganex-backend-1.0.0.jar > """ & logDir & "\java.log"" 2>&1", 0, False
    WScript.Sleep 5000
End If

' ── 3. Vite Frontend Preview (Port 3000) ──────────────────────────────────
WshShell.Run "cmd /c cd /d """ & root & """ && node node_modules\vite\bin\vite.js preview --host 127.0.0.1 --port 3000 > """ & logDir & "\frontend.log"" 2>&1", 0, False
WScript.Sleep 3000

' ── 4. Open browser ───────────────────────────────────────────────────────
WshShell.Run "http://localhost:3000", 1, False
