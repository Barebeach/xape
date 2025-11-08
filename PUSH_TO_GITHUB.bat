@echo off
echo ========================================
echo Push XAPE Website to GitHub
echo ========================================
echo.

echo Step 1: Adding remote...
git remote add origin https://github.com/Barebeach/xape.git

echo.
echo Step 2: Checking out main branch...
git branch -M main

echo.
echo Step 3: Adding website files...
git add website/

echo.
echo Step 4: Committing...
git commit -m "Add XAPE website for Vercel deployment"

echo.
echo Step 5: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://vercel.com/new
echo 2. Click "Import Git Repository"
echo 3. Select: Barebeach/xape
echo 4. Set Root Directory: website
echo 5. Click Deploy
echo.
pause

