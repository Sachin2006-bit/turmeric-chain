@echo off
REM GitHub Setup Script for TurmericChain

echo Setting up GitHub for TurmericChain...
echo.

REM Check if origin already exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote 'origin' already exists
    git remote -v
) else (
    set /p USERNAME="Please provide your GitHub username: "
    echo.
    echo Adding remote repository...
    git remote add origin "https://github.com/%USERNAME%/turmeric-chain.git"
    echo Remote added successfully!
)

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Done! Your code is now on GitHub

