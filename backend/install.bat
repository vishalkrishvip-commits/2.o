@echo off
cd /d "c:\Users\visha\OneDrive\Desktop\PROJECT 1\backend"
echo Installing dependencies...
call npm install
if %errorlevel% equ 0 (
    echo.
    echo ✓ Dependencies installed successfully!
    echo.
    echo Running setup script to initialize demo users...
    call node setup.js
) else (
    echo ✗ Failed to install dependencies
    pause
)
