param(
    [string]$WorkingDirectory = "C:\ProyectoAnalisis\backend\www",
    [int]$Port = 3001,
    [int]$TimeoutSeconds = 10
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIAR SERVIDOR NODE.JS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Detener cualquier proceso Node.js anterior
    Write-Host "Verificando procesos Node.js previos..." -ForegroundColor Yellow
    $existingNode = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($existingNode) {
        Write-Host "Deteniendo proceso Node.js anterior..." -ForegroundColor Yellow
        $existingNode | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "OK: Proceso anterior detenido" -ForegroundColor Green
    } else {
        Write-Host "OK: No hay procesos Node.js previos" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Verificando directorio: $WorkingDirectory" -ForegroundColor Yellow
    
    if (-not (Test-Path $WorkingDirectory)) {
        Write-Host "ERROR: Directorio no existe: $WorkingDirectory" -ForegroundColor Red
        exit 1
    }
    
    # Verificar que exista package.json
    if (-not (Test-Path (Join-Path $WorkingDirectory "package.json"))) {
        Write-Host "ERROR: No se encontro package.json en $WorkingDirectory" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "OK: Directorio valido" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Iniciando servidor Node.js..." -ForegroundColor Yellow
    Write-Host "  Directorio: $WorkingDirectory" -ForegroundColor White
    Write-Host "  Puerto: $Port" -ForegroundColor White
    Write-Host ""
    
    # Establecer variable de ambiente
    [Environment]::SetEnvironmentVariable("PORT", $Port, "Process")
    
    # Iniciar Node.js en background
    $nodeProcess = Start-Process -FilePath "node" `
                                 -ArgumentList "main.js" `
                                 -WorkingDirectory $WorkingDirectory `
                                 -NoNewWindow `
                                 -PassThru `
                                 -ErrorAction Stop
    
    $processId = $nodeProcess.Id
    Write-Host "OK: Proceso Node.js iniciado (PID: $processId)" -ForegroundColor Green
    
    # Esperar a que esté listo
    Write-Host ""
    Write-Host "Esperando a que el servidor este listo..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    $isReady = $false
    
    while ((Get-Date) -lt $startTime.AddSeconds($TimeoutSeconds)) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port/api" `
                                         -Method GET `
                                         -TimeoutSec 2 `
                                         -ErrorAction SilentlyContinue
            
            if ($response.StatusCode -eq 200) {
                $isReady = $true
                break
            }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }
    
    Write-Host ""
    
    if ($isReady) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "OK: SERVIDOR INICIADO EXITOSAMENTE" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Detalles:" -ForegroundColor Cyan
        Write-Host "  URL: http://localhost:$Port/" -ForegroundColor White
        Write-Host "  Health Check: http://localhost:$Port/api" -ForegroundColor White
        Write-Host "  Swagger: http://localhost:$Port/api" -ForegroundColor White
        Write-Host ""
        Write-Host "Proxy Inverso (IIS):" -ForegroundColor Cyan
        Write-Host "  Accede a: http://localhost/" -ForegroundColor White
        Write-Host "  Redirige a: http://localhost:$Port/" -ForegroundColor White
        Write-Host ""
        exit 0
    } else {
        Write-Host "WARNING: Servidor no respondio en $TimeoutSeconds segundos" -ForegroundColor Yellow
        Write-Host "El servidor podria estar iniciando aun..." -ForegroundColor Yellow
        Write-Host ""
        exit 0  # No fallar, puede estar iniciando
    }
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Fallo al iniciar servidor" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones:" -ForegroundColor Yellow
    Write-Host "  1. Verifica que Node.js este instalado" -ForegroundColor Gray
    Write-Host "  2. Verifica que exista package.json en $WorkingDirectory" -ForegroundColor Gray
    Write-Host "  3. Verifica que exista main.js en $WorkingDirectory" -ForegroundColor Gray
    Write-Host "  4. Verifica los logs en el directorio" -ForegroundColor Gray
    exit 1
}
