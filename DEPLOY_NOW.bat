@echo off
echo ========================================
echo   DEPLOYING XAPE BACKEND TO RAILWAY
echo ========================================
echo.

REM Navigate to backend
cd /d "%~dp0\backend"

echo Step 1: Linking to Railway project...
echo Please select "backend" when prompted
echo.
pause
railway link

echo.
echo Step 2: Deploying to Railway...
railway up

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Now set your environment variables in Railway:
echo   1. Run: railway open
echo   2. Go to Variables tab
echo   3. Add: OPENAI_API_KEY=your-key-here
echo   4. Verify: DISABLE_TOKEN_GATE=false
echo.

pause


