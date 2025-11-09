@echo off
echo ========================================
echo   XAPE Backend - Railway Deployment
echo ========================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Railway CLI not found!
    echo.
    echo Please install Railway CLI first:
    echo npm i -g @railway/cli
    echo.
    echo Or download from: https://docs.railway.app/develop/cli
    pause
    exit /b 1
)

echo ✅ Railway CLI found!
echo.

REM Navigate to backend directory
cd /d "%~dp0"

echo 📂 Current directory: %CD%
echo.

REM Check if logged in to Railway
railway whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🔐 Not logged in to Railway. Opening browser to login...
    railway login
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Login failed!
        pause
        exit /b 1
    )
)

echo ✅ Logged in to Railway
echo.

echo 🚀 Deploying to Railway...
echo.
echo This will:
echo   1. Link to your Railway project (if not already linked)
echo   2. Deploy the latest code
echo   3. Set environment variables from config.env
echo.

REM Deploy
railway up

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Next steps:
    echo   1. Go to railway.app and open your project
    echo   2. Copy the public URL
    echo   3. Update the backend URL in your extension
    echo.
    echo IMPORTANT: Make sure these environment variables are set in Railway:
    echo   - OPENAI_API_KEY
    echo   - DISABLE_TOKEN_GATE=false
    echo   - SOLANA_RPC_URL (optional, defaults to mainnet)
    echo   - PORT (Railway sets this automatically)
    echo.
) else (
    echo ❌ Deployment failed!
)

pause

