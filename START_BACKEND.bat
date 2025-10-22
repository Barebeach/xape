@echo off
echo.
echo ========================================
echo   Starting XAPE Backend Server...
echo ========================================
echo.
cd backend
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  echo.
)
echo Starting server...
node server.js
pause

