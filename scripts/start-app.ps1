<#
.SYNOPSIS
  GovMind AI — PowerShell Dual Service Launcher
  Launches Backend (FastAPI) first, verifies health check constraint, then launches Frontend.
#>

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$PythonVenv = Join-Path $RootDir ".venv\Scripts\python.exe"

Write-Host "`n=== GovMind AI — Service Orchestrator ===" -ForegroundColor Magenta

# 1. Check Ollama
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "[OLLAMA]   ✔ Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "[OLLAMA]   ⚠ Warning: Ollama not detected at http://127.0.0.1:11434. Start Ollama for AI chat." -ForegroundColor Yellow
}

# 2. Check or Start Backend
$backendPort = 8000
$healthUrl = "http://127.0.0.1:$backendPort/health"

$backendHealthy = $false
try {
    $res = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($res.status -eq "ok") {
        Write-Host "[BACKEND]  ✔ Ingestion service already running on port $backendPort." -ForegroundColor Green
        $backendHealthy = $true
    }
} catch {}

$backendJob = $null
if (-not $backendHealthy) {
    Write-Host "[BACKEND]  Starting FastAPI Ingestion Service on port $backendPort..." -ForegroundColor Cyan
    $ingestionDir = Join-Path $RootDir "ingestion-service"
    
    $backendProcess = Start-Process -FilePath $PythonVenv -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port $backendPort" -WorkingDirectory $ingestionDir -PassThru -NoNewWindow

    # Poll health constraint
    $retries = 30
    while ($retries -gt 0 -and -not $backendHealthy) {
        Start-Sleep -Milliseconds 800
        try {
            $res = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($res.status -eq "ok") {
                $backendHealthy = $true
                Write-Host "[BACKEND]  ✔ Health constraint met! /health is online." -ForegroundColor Green
                break
            }
        } catch {}
        $retries--
    }

    if (-not $backendHealthy) {
        Write-Host "[BACKEND]  ❌ Error: Ingestion service failed to start within timeout." -ForegroundColor Red
        if ($backendProcess) { Stop-Process -Id $backendProcess.Id -Force }
        exit 1
    }
}

# 3. Launch Frontend
Write-Host "[FRONTEND] Backend ready. Starting Next.js frontend on port 3000..." -ForegroundColor Cyan
try {
    npm run dev
} finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "`n[CLEANUP]  Shutting down backend process..." -ForegroundColor Gray
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
