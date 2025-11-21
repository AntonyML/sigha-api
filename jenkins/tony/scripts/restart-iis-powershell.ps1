param(
    [int]$TimeoutSeconds = 30
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IIS RESTART SCRIPT (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como admin
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")
if (-not $isAdmin) {
    Write-Host "WARNING: Este script debería ejecutarse como ADMINISTRADOR" -ForegroundColor Yellow
    Write-Host "Intentando reiniciar IIS..." -ForegroundColor Yellow
}

Write-Host "Intentando detener servicios de IIS..." -ForegroundColor Yellow

try {
    # Detener servicios específicos
    $services = @("W3SVC", "WAS")
    
    foreach ($service in $services) {
        $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
        if ($svc) {
            Write-Host "  Stopping $service... " -NoNewline
            Stop-Service -Name $service -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            
            if ((Get-Service -Name $service).Status -eq "Stopped") {
                Write-Host "✓ OK" -ForegroundColor Green
            } else {
                Write-Host "⚠ Still running" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
    Write-Host "Waiting 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "Intentando iniciar servicios de IIS..." -ForegroundColor Yellow
    
    # Iniciar servicios en orden inverso
    foreach ($service in @("WAS", "W3SVC")) {
        $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
        if ($svc) {
            Write-Host "  Starting $service... " -NoNewline
            
            try {
                Start-Service -Name $service -ErrorAction Stop
                
                # Esperar a que inicie
                $timeout = 0
                while ((Get-Service -Name $service).Status -ne "Running" -and $timeout -lt $TimeoutSeconds) {
                    Start-Sleep -Seconds 1
                    $timeout++
                }
                
                if ((Get-Service -Name $service).Status -eq "Running") {
                    Write-Host "✓ OK" -ForegroundColor Green
                } else {
                    Write-Host "✗ FAILED - Timeout" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "✗ FAILED - $_" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "Verificando estado de servicios:" -ForegroundColor Yellow
    
    $allRunning = $true
    foreach ($service in @("W3SVC", "WAS")) {
        $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
        if ($svc) {
            $status = $svc.Status
            $color = if ($status -eq "Running") { "Green" } else { "Red" }
            Write-Host "  $service : $status" -ForegroundColor $color
            if ($status -ne "Running") {
                $allRunning = $false
            }
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    
    if ($allRunning) {
        Write-Host "✓ IIS SERVICES RESTARTED SUCCESSFULLY" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "IIS is now running and ready to serve requests" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠ WARNING: Some IIS services failed to start" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please check IIS Event Logs for more details" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ERROR: IIS restart failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Ejecutar PowerShell como ADMINISTRADOR" -ForegroundColor Gray
    Write-Host "2. Verificar Event Viewer para errores de IIS" -ForegroundColor Gray
    Write-Host "3. Reiniciar manualmente: iisreset /restart" -ForegroundColor Gray
    exit 1
}
