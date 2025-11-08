@echo off
echo ========================================
echo XAPE - Chrome Store Package Builder
echo ========================================
echo.

echo Cleaning up old package...
if exist xape-extension.zip del xape-extension.zip
if exist temp-package rmdir /s /q temp-package

echo Creating package directory...
mkdir temp-package

echo Copying extension files...
copy manifest.json temp-package\
copy config.js temp-package\
copy content.js temp-package\
copy skillbar-classes.js temp-package\
copy border-animation.js temp-package\
copy scam-detector.js temp-package\
copy cabal-monitor.js temp-package\
copy time-grouping.js temp-package\
copy xape-phonetic-utils.js temp-package\
copy xape-data-extractors.js temp-package\
copy xape-wallet-analysis.js temp-package\
copy xape-helper-utils.js temp-package\
copy xape-speech.js temp-package\
copy xape-ui-builder.js temp-package\
copy xape-html-templates.js temp-package\
copy xape-voice-processor.js temp-package\
copy xape-validation.js temp-package\
copy xape-animations.js temp-package\
copy xape-market-cap.js temp-package\
copy styles.css temp-package\
copy popup.html temp-package\
copy popup.js temp-package\
copy README.md temp-package\

echo Copying icons...
mkdir temp-package\icons
copy icons\logo16.png temp-package\icons\
copy icons\logo.png temp-package\icons\
copy icons\icon128.png temp-package\icons\
copy icons\brain.gif temp-package\icons\
if exist icons\logo48.png copy icons\logo48.png temp-package\icons\

echo Creating ZIP archive...
powershell Compress-Archive -Path temp-package\* -DestinationPath xape-extension.zip -Force

echo Cleaning up temporary files...
rmdir /s /q temp-package

echo.
echo ========================================
echo SUCCESS! Package created: xape-extension.zip
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://chrome.google.com/webstore/devconsole
echo 2. Click "New Item"
echo 3. Upload xape-extension.zip
echo 4. Fill in store listing (see GOOGLE_STORE_SUBMISSION.md)
echo 5. Submit for review
echo.
pause

