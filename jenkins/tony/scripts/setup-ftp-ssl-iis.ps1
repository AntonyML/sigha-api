# Configure IIS FTP-Backend site with SSL/TLS certificate
# This script uses direct XML configuration of IIS applicationHost.config

Write-Host "========================================"
Write-Host "FTP SSL CERTIFICATE SETUP - IIS"
Write-Host "========================================"
Write-Host ""

# Stop FTP-Backend site first
Write-Host "Step 1: Stopping FTP-Backend site..."
C:\Windows\System32\inetsrv\appcmd.exe stop site "FTP-Backend"
Start-Sleep -Seconds 2
Write-Host "Done"
Write-Host ""

# Get certificate thumbprint
Write-Host "Step 2: Finding localhost certificate..."
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -like '*localhost*' } | Select-Object -First 1
if ($null -eq $cert) {
    Write-Host "ERROR: No localhost certificate found"
    exit 1
}
$thumbprint = $cert.Thumbprint
Write-Host "Certificate found: $thumbprint"
Write-Host "Subject: $($cert.Subject)"
Write-Host ""

# Step 3: Update IIS configuration XML directly
Write-Host "Step 3: Updating IIS configuration..."
$configPath = "C:\Windows\System32\inetsrv\config\applicationHost.config"

# Backup original config
$backupPath = "$configPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path $configPath -Destination $backupPath -Force
Write-Host "Config backed up to: $backupPath"
Write-Host ""

# Load XML
[xml]$config = Get-Content $configPath

# Find or create FTP-Backend site in XML
$sitesNode = $config.SelectSingleNode("//sites")
$ftpSite = $sitesNode.SelectSingleNode("site[@name='FTP-Backend']")

if ($null -eq $ftpSite) {
    Write-Host "ERROR: FTP-Backend site not found in configuration"
    exit 1
}

# Remove existing FTPS bindings
$existingFtpsBindings = $ftpSite.SelectNodes("bindings/binding[@protocol='ftps']")
foreach ($binding in $existingFtpsBindings) {
    $binding.ParentNode.RemoveChild($binding) | Out-Null
}
Write-Host "Removed existing FTPS bindings"
Write-Host ""

# Add FTPS binding with SSL
Write-Host "Step 4: Adding FTPS binding on port 990..."
$bindingsNode = $ftpSite.SelectSingleNode("bindings")
$newBinding = $config.CreateElement("binding")
$newBinding.SetAttribute("protocol", "ftps")
$newBinding.SetAttribute("bindingInformation", "*:990:")
$bindingsNode.AppendChild($newBinding) | Out-Null
Write-Host "FTPS binding added"
Write-Host ""

# Add sslFlags to FTP system settings
Write-Host "Step 5: Configuring SSL flags..."
$ftpSystemNode = $config.SelectSingleNode("//system.ftpServer/security/ssl")
if ($null -eq $ftpSystemNode) {
    $systemFtpNode = $config.SelectSingleNode("//system.ftpServer")
    if ($null -eq $systemFtpNode) {
        $systemFtpNode = $config.CreateElement("system.ftpServer")
        $config.DocumentElement.AppendChild($systemFtpNode) | Out-Null
    }
    
    $securityNode = $systemFtpNode.SelectSingleNode("security")
    if ($null -eq $securityNode) {
        $securityNode = $config.CreateElement("security")
        $systemFtpNode.AppendChild($securityNode) | Out-Null
    }
    
    $ftpSystemNode = $config.CreateElement("ssl")
    $securityNode.AppendChild($ftpSystemNode) | Out-Null
}

# Set SSL attributes
$ftpSystemNode.SetAttribute("serverCertHash", $thumbprint)
$ftpSystemNode.SetAttribute("controlChannelPolicy", "SslRequire")
$ftpSystemNode.SetAttribute("dataChannelPolicy", "SslAllow")
Write-Host "SSL flags configured"
Write-Host ""

# Save configuration
Write-Host "Step 6: Saving configuration..."
$config.Save($configPath)
Write-Host "Configuration saved"
Write-Host ""

# Restart FTP service
Write-Host "Step 7: Restarting FTP service..."
Restart-Service -Name ftpsvc -Force
Start-Sleep -Seconds 3
Write-Host "FTP service restarted"
Write-Host ""

# Start FTP-Backend site
Write-Host "Step 8: Starting FTP-Backend site..."
C:\Windows\System32\inetsrv\appcmd.exe start site "FTP-Backend"
Start-Sleep -Seconds 2
Write-Host "Done"
Write-Host ""

# Verify
Write-Host "Step 9: Verifying configuration..."
$result = C:\Windows\System32\inetsrv\appcmd.exe list site "FTP-Backend"
Write-Host $result
Write-Host ""

# Test connection
Write-Host "Step 10: Testing FTP connection..."
$testResult = Test-NetConnection -ComputerName localhost -Port 21 -WarningAction SilentlyContinue
if ($testResult.TcpTestSucceeded) {
    Write-Host "FTP port 21: OPEN (OK)"
} else {
    Write-Host "FTP port 21: CLOSED (WARNING)"
}

$testResult990 = Test-NetConnection -ComputerName localhost -Port 990 -WarningAction SilentlyContinue
if ($testResult990.TcpTestSucceeded) {
    Write-Host "FTPS port 990: OPEN (OK)"
} else {
    Write-Host "FTPS port 990: CLOSED (not required if using implicit FTP)"
}

Write-Host ""
Write-Host "========================================"
Write-Host "SETUP COMPLETED"
Write-Host "========================================"
Write-Host ""
Write-Host "Certificate Thumbprint: $thumbprint"
Write-Host "FTP Site: FTP-Backend"
Write-Host "FTP Port: 21 (with SSL)"
Write-Host "FTPS Implicit Port: 990"
Write-Host ""

exit 0
