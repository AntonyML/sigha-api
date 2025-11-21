param(
    [string]$WorkingDirectory = "C:\ProyectoAnalisis\backend\www",
    [int]$Port = 3001,
    [int]$TimeoutSeconds = 10
)

Write-Host "========================================"
Write-Host "INICIAR SERVIDOR NODE.JS"
Write-Host "========================================"
Write-Host ""

try {
    Write-Host "Verificando procesos Node.js previos..."
    $existingNode = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($existingNode) {
        Write-Host "Deteniendo proceso Node.js anterior..."
        $existingNode | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "OK: Proceso anterior detenido"
    } else {
        Write-Host "OK: No hay procesos Node.js previos"
    }
    
    Write-Host ""
    Write-Host "Verificando directorio: $WorkingDirectory"
    
    if (-not (Test-Path $WorkingDirectory)) {
        Write-Host "ERROR: Directorio no existe"
        exit 1
    }
    
    if (-not (Test-Path (Join-Path $WorkingDirectory "package.json"))) {
        Write-Host "ERROR: No se encontro package.json"
        exit 1
    }
    
    Write-Host "OK: Directorio valido"
    Write-Host ""
    
    Write-Host "Iniciando servidor Node.js..."
    Write-Host "  Directorio: $WorkingDirectory"
    Write-Host "  Puerto: $Port"
    Write-Host ""
    
    [Environment]::SetEnvironmentVariable("PORT", $Port, "Process")
    [Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Process")
    
    $nodeProcess = Start-Process -FilePath "node" `
                                 -ArgumentList "main.js" `
                                 -WorkingDirectory $WorkingDirectory `
                                 -NoNewWindow `
                                 -PassThru `
                                 -ErrorAction Stop
    
    $processId = $nodeProcess.Id
    Write-Host "OK: Proceso Node.js iniciado (PID: $processId)"
    
    Write-Host ""
    Write-Host "Esperando a que el servidor este listo..."
    
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
        Write-Host "========================================"
        Write-Host "OK: SERVIDOR INICIADO EXITOSAMENTE"
        Write-Host "========================================"
        Write-Host ""
        Write-Host "URL: http://localhost:$Port/"
        Write-Host ""
        exit 0
    } else {
        Write-Host "WARNING: Servidor no respondio en $TimeoutSeconds segundos"
        Write-Host "El servidor podria estar iniciando aun..."
        Write-Host ""
        exit 0
    }
}
catch {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "ERROR: Fallo al iniciar servidor"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)"
    exit 1
}
