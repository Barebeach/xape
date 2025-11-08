@echo off
echo.
echo ========================================
echo   Testing XAPE Backend...
echo ========================================
echo.
echo Testing health endpoint...
curl http://localhost:3000/health
echo.
echo.
echo Testing AI chat endpoint...
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello XAPE!\"}"
echo.
echo.
echo ========================================
echo   If you see responses above, it works!
echo ========================================
echo.
pause



















