@echo off
echo ========================================
echo XAPE - Clean Extension Reload
echo ========================================
echo.

echo Step 1: Close Chrome completely...
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 >nul

echo.
echo Step 2: Clearing Chrome extension cache...
del /F /Q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\*.*" 2>nul
rd /S /Q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" 2>nul

echo.
echo ========================================
echo Extension cache cleared!
echo ========================================
echo.
echo Next steps:
echo 1. Open Chrome
echo 2. Go to chrome://extensions/
echo 3. REMOVE the XAPE extension completely
echo 4. Click "Load unpacked"
echo 5. Select: C:\Users\Phill\Desktop\orgy
echo 6. Done!
echo ========================================
pause

