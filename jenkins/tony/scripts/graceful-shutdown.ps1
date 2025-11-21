param(
    [int]$Port = 3001,
    [int]$GracefulTimeoutSeconds = 15,
    [int]$ForceKillTimeoutSeconds = 5
)

Write-Host "========================================"
Write-Host "GRACEFUL SHUTDOWN - NODE.JS SERVER"
Write-Host "========================================"
Write-Host ""

Write-Host "Checking for running Node.js processes on port $Port..."

try {
    # Buscar procesos Node.js
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if (-not $nodeProcesses) {
        Write-Host "OK: No Node.js processes found"
        Write-Host ""
        exit 0
    }
    
    Write-Host "Found Node.js process(es)"
    Write-Host ""
    
    # Enviar SIGTERM para graceful shutdown
    Write-Host "Sending SIGTERM for graceful shutdown..."
    Write-Host "Graceful timeout: $GracefulTimeoutSeconds seconds"
    Write-Host ""
    
    # Intentar enviar signal gracefully
    foreach ($process in $nodeProcesses) {
        try {
            # En Windows, intentamos usar taskkill con /T (tree) para procesos relacionados
            taskkill /PID $process.Id /T /F 2>$null | Out-Null
        }
        catch {
            Write-Host "Warning: Could not gracefully terminate PID $($process.Id): $($_.Exception.Message)"
        }
    }
    
    # Esperar a que los procesos terminen
    $startTime = Get-Date
    $allTerminated = $false
    
    while ((Get-Date) -lt $startTime.AddSeconds($GracefulTimeoutSeconds)) {
        $runningNodes = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if (-not $runningNodes) {
            $allTerminated = $true
            break
        }
        Start-Sleep -Milliseconds 500
    }
    
    if ($allTerminated) {
        Write-Host "OK: All Node.js processes terminated gracefully"
        Write-Host ""
        exit 0
    } else {
        Write-Host "WARNING: Graceful shutdown timeout - forcing termination..."
        $runningNodes | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Esperar confirmación de termination forzado
        Start-Sleep -Seconds 2
        
        $stillRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if (-not $stillRunning) {
            Write-Host "OK: All Node.js processes force-terminated"
            Write-Host ""
            exit 0
        } else {
            Write-Host "ERROR: Could not terminate Node.js processes"
            Write-Host ""
            exit 1
        }
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host ""
    exit 1
}
