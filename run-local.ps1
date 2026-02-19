# VectorShield Local Run Script (Windows PowerShell)
# This script runs both backend and frontend locally, fully accessible by anyone via ngrok tunnel

Write-Host "================================" -ForegroundColor Cyan
Write-Host "VectorShield Local Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
Write-Host "Checking ngrok installation..." -ForegroundColor Yellow
try {
    $ngrokVersion = ngrok version 2>$null
    Write-Host "✓ ngrok is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ ngrok not found. Installing..." -ForegroundColor Red
    Write-Host "Download from: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Or install via Chocolatey: choco install ngrok" -ForegroundColor Yellow
    Read-Host "Press Enter after installing ngrok"
}

# Get ngrok auth token (if needed)
Write-Host ""
Write-Host "Setting up ngrok tunnels..." -ForegroundColor Yellow
ngrok authtoken your_token_here 2>$null

# Start backend
Write-Host ""
Write-Host "Starting Backend (port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @"
Set-Location "c:\Users\Hp\OneDrive\Desktop\vectorshield 2.0\vectorshield"
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
"@

# Start frontend
Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @"
Set-Location "c:\Users\Hp\OneDrive\Desktop\vectorshield 2.0\vectorshield\frontend"
npm run dev
"@

# Wait for services to start
Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start ngrok tunnels
Write-Host ""
Write-Host "Starting ngrok tunnels..." -ForegroundColor Cyan
Write-Host ""

# Open ngrok tunnels in separate windows
Start-Process ngrok -ArgumentList "http 8000 --remote-header X-Forwarded-Proto:https" -WindowStyle Normal

Write-Host ""
Write-Host "✓ Services Started!" -ForegroundColor Green
Write-Host ""
Write-Host "Local Access:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Public Access (via ngrok):" -ForegroundColor Cyan
Write-Host "  Check ngrok window for public URL (e.g., https://xxxx-xx-xxx.ngrok.io)" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to keep services running..." -ForegroundColor Yellow
Read-Host
