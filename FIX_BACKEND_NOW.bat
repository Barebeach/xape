@echo off
echo ========================================
echo   QUICK FIX - Add OPENAI_API_KEY
echo ========================================
echo.
echo Your backend is crashing because OPENAI_API_KEY is missing!
echo.
echo Option 1: Add via Railway Dashboard
echo   1. Go to: https://railway.app/project/072de1e8-e3d8-4546-a0f0-c2855230f090
echo   2. Click "Postgres" service
echo   3. Go to "Variables" tab
echo   4. Add: OPENAI_API_KEY = sk-your-key-here
echo.
echo Option 2: Add via CLI (paste your key when prompted)
echo.
set /p API_KEY="Enter your OpenAI API key (sk-...): "

if "%API_KEY%"=="" (
    echo No key provided. Please use Option 1 above.
    pause
    exit /b 1
)

echo.
echo Adding OPENAI_API_KEY to Railway...
cd backend
railway variables --service 3140e71c-101d-49e7-932d-959400ebf278 --set OPENAI_API_KEY=%API_KEY%
railway variables --service 3140e71c-101d-49e7-932d-959400ebf278 --set DISABLE_TOKEN_GATE=false

echo.
echo ✅ Done! Backend will redeploy automatically.
echo Wait 30 seconds, then test your extension!
echo.
pause

