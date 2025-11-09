@echo off
echo ========================================
echo   Setting Railway Environment Variables
echo ========================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Railway CLI not found!
    echo Please install: npm i -g @railway/cli
    pause
    exit /b 1
)

cd /d "%~dp0"

echo This will set the required environment variables in Railway.
echo.
echo ⚠️  IMPORTANT: Make sure you have your OPENAI_API_KEY ready!
echo.
pause

REM Set critical environment variables
echo Setting DISABLE_TOKEN_GATE=false (TOKEN GATE ENABLED)...
railway variables --set DISABLE_TOKEN_GATE=false

echo Setting SOLANA_RPC_URL...
railway variables --set SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

echo Setting ALLOWED_ORIGINS...
railway variables --set ALLOWED_ORIGINS=*

echo Setting NODE_ENV...
railway variables --set NODE_ENV=production

echo.
echo ⚠️  You still need to set your OPENAI_API_KEY manually:
echo.
echo Option 1: Via CLI
echo   railway variables --set OPENAI_API_KEY=your-key-here
echo.
echo Option 2: Via Dashboard
echo   1. Run: railway open
echo   2. Go to Variables tab
echo   3. Add OPENAI_API_KEY=your-key-here
echo.

pause

