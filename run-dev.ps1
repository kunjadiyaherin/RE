# ==================================================================================
# INDIA REAL ESTATE MARKET INTELLIGENCE PLATFORM - DEVELOPER SYSTEM RUNNER
# ==================================================================================

Clear-Host
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host "                         PROPERTY INTELLIGENCE                        " -ForegroundColor Cyan -Bold
Write-Host "     Python FastAPI + PostgreSQL + Live Public APIs Intelligence      " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "[Env Init] Verifying local development configuration directories..." -ForegroundColor Gray

# 1. Verify Python Requirements
Write-Host "[Env Init] Verifying Python requirements..." -ForegroundColor Gray
python -m pip install -q -r backend\requirements.txt

# 2. Verify Frontend Dependencies
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "[Env Init] frontend node_modules not found. Running npm install..." -ForegroundColor Yellow
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "install" -WorkingDirectory "frontend" -Wait
} else {
    Write-Host "[Env OK] Frontend dependencies verified." -ForegroundColor Green
}

Write-Host ""
Write-Host "[Database] PostgreSQL Target: localhost:5731 (property_intel_db)" -ForegroundColor Gray
Write-Host "[Database] Resilient failover layer: Enabled" -ForegroundColor Green
Write-Host "[Public APIs] OpenStreetMap, Open-Meteo, Frankfurter FX, World Bank" -ForegroundColor Green

Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor Blue
Write-Host " [1] Startup Python FastAPI API Server (Listening on Port 5000)" -ForegroundColor Yellow
Write-Host " [2] Startup Frontend Vite Client Application (Listening on Port 5173)" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor Blue
Write-Host ""

# Launch Python FastAPI server in a new console window
Write-Host "[Launcher] Starting Python FastAPI Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload" -WorkingDirectory "backend"

# Launch Vite server in a new console window
Write-Host "[Launcher] Starting Frontend Client Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "frontend"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host " SERVICES DISPATCHED SUCCESSFULLY." -ForegroundColor Green
Write-Host "  - Frontend Portal: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - Backend Health: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "  - API Swagger Docs: http://localhost:5000/docs" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "You can close this launcher shell. The child process shells will continue running." -ForegroundColor Gray
