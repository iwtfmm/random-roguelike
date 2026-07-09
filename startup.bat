@echo off
title Random Roguelike Launcher
cd /d "%~dp0"

echo.
echo  ===============================================
echo   Random Roguelike Launcher
echo  ===============================================
echo.

REM Detect if port 5173 is already listening
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul && goto running

echo  Starting local server...
echo  Browser will open automatically. Keep this window open.
echo.

call npm run dev

if errorlevel 1 pause
goto :eof

:running
echo  Server already running. Opening browser...
start "" "http://127.0.0.1:5173/"
timeout /t 2 /nobreak >nul
