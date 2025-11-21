param(
    [string]$WorkingDirectory = "C:\ProyectoAnalisis\backend\www",
    [int]$Port = 3001,
    [int]$TimeoutSeconds = 10,
    [bool]$WasRunning = $false
)

Write-Host "========================================"
if ($WasRunning) {
    Write-Host "RESTARTING NODE.JS SERVER"
} else {
    Write-Host "STARTING NODE.JS SERVER"
}
Write-Host "========================================"
Write-Host ""

try {
    Write-Host "Verifying directory: $WorkingDirectory"
    
    if (-not (Test-Path $WorkingDirectory)) {
        Write-Host "ERROR: Directory not found: $WorkingDirectory"
        exit 1
    }
    
    if (-not (Test-Path (Join-Path $WorkingDirectory "package.json"))) {
        Write-Host "ERROR: package.json not found in $WorkingDirectory"
        exit 1
    }
    
    Write-Host "OK: Directory structure valid"
    Write-Host ""
    
    # Asegurar que no hay procesos Node.js restantes
    Write-Host "Checking for lingering Node.js processes..."
    $existingNode = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($existingNode) {
        Write-Host "Found lingering Node.js process(es), terminating..."
        $existingNode | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    } else {
        Write-Host "OK: No lingering processes found"
    }
    
    Write-Host ""
    Write-Host "Starting Node.js server..."
    Write-Host "  Directory: $WorkingDirectory"
    Write-Host "  Port: $Port"
    Write-Host "  Environment: production"
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
    Write-Host "OK: Node.js process started (PID: $processId)"
    
    Write-Host ""
    Write-Host "Waiting for server to be ready..."
    
    $startTime = Get-Date
    $isReady = $false
    $attemptCount = 0
    
    while ((Get-Date) -lt $startTime.AddSeconds($TimeoutSeconds)) {
        $attemptCount++
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
        Write-Host "OK: SERVER STARTED SUCCESSFULLY"
        Write-Host "========================================"
        Write-Host ""
        Write-Host "URL: http://localhost:$Port/"
        Write-Host "Status: Ready to serve requests"
        Write-Host ""
        exit 0
    } else {
        Write-Host "WARNING: Server did not respond in $TimeoutSeconds seconds"
        Write-Host "Attempts made: $attemptCount"
        Write-Host "The server might still be starting..."
        Write-Host ""
        
        # Verificar que el proceso sigue ejecutándose
        $checkProcess = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($checkProcess) {
            Write-Host "Process is still running (PID: $processId)"
            Write-Host ""
            exit 0
        } else {
            Write-Host "ERROR: Process is not running"
            exit 1
        }
    }
}
catch {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "ERROR: Failed to start server"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)"
    exit 1
}
