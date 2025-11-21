param(
    [int]$Port = 3001,
    [int]$TimeoutSeconds = 5
)

Write-Host "========================================"
Write-Host "CHECK SERVER STATUS"
Write-Host "========================================"
Write-Host ""

Write-Host "Checking if port $Port is listening..."

try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connectionResult = $tcpClient.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connectionWait = $connectionResult.AsyncWaitHandle.WaitOne($TimeoutSeconds * 1000, $false)
    
    if ($connectionWait -and $tcpClient.Connected) {
        $tcpClient.EndConnect($connectionResult)
        $tcpClient.Close()
        Write-Host "Status: RUNNING (Port $Port is listening)"
        Write-Host ""
        exit 0  # SERVER IS RUNNING
    } else {
        if ($tcpClient.Connected) {
            $tcpClient.EndConnect($connectionResult)
        }
        $tcpClient.Close()
        Write-Host "Status: STOPPED (Port $Port is not listening)"
        Write-Host ""
        exit 1  # SERVER IS NOT RUNNING
    }
}
catch {
    Write-Host "Status: STOPPED (Port $Port is not listening - Error: $($_.Exception.Message))"
    Write-Host ""
    exit 1  # SERVER IS NOT RUNNING
}
