@echo off
echo ========================================
echo   Push Backend and Fixes to GitHub
echo ========================================
echo.
echo All changes are committed and ready to push!
echo.
echo Changes include:
echo   - Backend folder with all server files
echo   - Voice announcement fix in content.js
echo   - Website updates with extension download link
echo.
echo Running: git push origin main
echo.
pause

git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo Next: Railway will auto-deploy from GitHub
    echo OR manually deploy: railway up --service 3140e71c-101d-49e7-932d-959400ebf278
    echo.
) else (
    echo.
    echo ❌ Push failed!
    echo.
    echo You may need to authenticate with GitHub first.
    echo Try: gh auth login
    echo.
)

pause

