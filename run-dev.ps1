# ==================================================================================
# INDIA REAL ESTATE MARKET INTELLIGENCE PLATFORM - DEVELOPER SYSTEM RUNNER
# ==================================================================================

Clear-Host
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host "                         PROPERTY INTELLIGENCE                        " -ForegroundColor Cyan -Bold
Write-Host "               Official Records & Analytics Aggregate Engine          " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "[Env Init] Verifying local development configuration directories..." -ForegroundColor Gray

# 1. Verify Node Modules
if (!(Test-Path "backend\node_modules")) {
    Write-Host "[Env Init] backend node_modules not found. Running npm install..." -ForegroundColor Yellow
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "install" -WorkingDirectory "backend" -Wait
} else {
    Write-Host "[Env OK] Backend node modules verified." -ForegroundColor Green
}

if (!(Test-Path "frontend\node_modules")) {
    Write-Host "[Env Init] frontend node_modules not found. Running npm install..." -ForegroundColor Yellow
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "install" -WorkingDirectory "frontend" -Wait
} else {
    Write-Host "[Env OK] Frontend node modules verified." -ForegroundColor Green
}

Write-Host ""
Write-Host "[Database] Standard Link: mongodb://127.0.0.1:27017/real_estate_db" -ForegroundColor Gray
Write-Host "[Database] Database Compass viewer check active." -ForegroundColor Gray
Write-Host "[Database] Dynamic Offline Failover logic is armed." -ForegroundColor Green

Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor Blue
Write-Host " [1] Startup backend Express API Server (Listening on Port 5000)" -ForegroundColor Yellow
Write-Host " [2] Startup frontend Vite client application (Listening on Port 5173)" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor Blue
Write-Host ""

# Launch Express server in a new console window
Write-Host "[Launcher] Starting Backend API Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "backend"

# Launch Vite server in a new console window
Write-Host "[Launcher] Starting Frontend Client Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "frontend"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host " SERVICES DISPATCHED SUCCESSFULLY." -ForegroundColor Green
Write-Host "  - Frontend Portal: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - Backend Health: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "You can close this launcher shell. The child process shells will continue running." -ForegroundColor Gray
