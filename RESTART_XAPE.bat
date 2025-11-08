@echo off
echo.
echo ================================================
echo    🎤 RESTARTING XAPE BACKEND - NEW VERSION
echo ================================================
echo.
echo Stopping any existing backend processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting XAPE backend with fixes...
echo.
cd backend
start cmd /k "node server.js"
echo.
echo ✅ Backend started in new window!
echo.
echo 🎤 XAPE is now ready for voice commands
echo.
echo Try saying:
echo   - "do you copy"
echo   - "how are you" 
echo   - "what do you see"
echo   - "do you have any data"
echo.
pause


















