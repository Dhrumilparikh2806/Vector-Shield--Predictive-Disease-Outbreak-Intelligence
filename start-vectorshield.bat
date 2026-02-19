@echo off
REM VectorShield - One-Click Local Startup Script (Windows)
REM This starts Backend, Frontend, and ngrok tunnel in separate windows

cls
color 0A
echo.
echo ================================
echo VectorShield Local Startup
echo ================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok not found!
    echo.
    echo Please install ngrok first:
    echo 1. Visit https://ngrok.com/download
    echo 2. Download and extract ngrok.exe
    echo 3. Add to PATH or move to C:\Program Files\ngrok\
    echo.
    pause
    exit /b 1
)

echo Starting VectorShield services...
echo.

REM Get the project directory
cd /d "%~dp0"

REM Start Backend
echo Starting Backend (port 8000)...
start "VectorShield-Backend" cmd /k ^
    "cd /d "%cd%" && .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000"

REM Wait a bit before starting frontend
timeout /t 2 /nobreak

REM Start Frontend
echo Starting Frontend (port 5173)...
start "VectorShield-Frontend" cmd /k ^
    "cd /d "%cd%\frontend" && npm run dev"

REM Wait for services to initialize
timeout /t 3 /nobreak

REM Start ngrok tunnel
echo Starting ngrok tunnel...
start "VectorShield-Tunnel" cmd /k ^
    "ngrok http 8000 --remote-header X-Forwarded-Proto:https"

REM Show status
echo.
echo ================================
echo Services Starting!
echo ================================
echo.
echo Local URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo Public URL:
echo   Check the "VectorShield-Tunnel" window for your ngrok URL
echo   It will look like: https://abc123def456.ngrok.io
echo.
echo IMPORTANT:
echo   1. Keep all three windows open
echo   2. Share the ngrok URL (https://...) with others
echo   3. They can access it from any browser
echo.
pause
