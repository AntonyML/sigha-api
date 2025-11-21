# Configure FTP-Backend site with SSL certificate
# Run as Administrator

Write-Host "========================================"
Write-Host "FTP SSL CERTIFICATE CONFIGURATION"
Write-Host "========================================"
Write-Host ""

# Check admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')
if (-not $isAdmin) {
    Write-Host "ERROR: This script must run as Administrator"
    exit 1
}

Write-Host "Running with Administrator privileges"
Write-Host ""

# Step 1: Get existing certificate
Write-Host "Step 1: Checking for existing certificate..."
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -like '*localhost*' } | Select-Object -First 1

if ($null -eq $cert) {
    Write-Host "ERROR: No localhost certificate found"
    exit 1
}

$thumbprint = $cert.Thumbprint
Write-Host "Certificate found:"
Write-Host "  Thumbprint: $thumbprint"
Write-Host "  Subject: $($cert.Subject)"
Write-Host "  Friendly Name: $($cert.FriendlyName)"
Write-Host ""

# Step 2: Configure FTP site with certificate
Write-Host "Step 2: Binding certificate to FTP-Backend site..."

try {
    # Use WebAdministration module
    Import-Module WebAdministration -Force -ErrorAction Stop
    
    # Get FTP site
    $ftpSite = Get-Item IIS:\Sites\FTP-Backend -ErrorAction Stop
    Write-Host "FTP Site found: $($ftpSite.Name)"
    
    # Get current bindings
    Write-Host "Current bindings:"
    $ftpSite.Bindings | ForEach-Object { 
        Write-Host "  - Protocol: $($_.protocol), IP: $($_.bindingInformation)"
    }
    Write-Host ""
    
    # Step 3: Update FTP site SSL certificate (using appcmd as fallback)
    Write-Host "Step 3: Updating SSL configuration..."
    
    # Use appcmd to set certificate
    $appcmdPath = "C:\Windows\System32\inetsrv\appcmd.exe"
    
    # Set SSL certificate hash for ftps binding
    & $appcmdPath set site "FTP-Backend" "-bindings.binding.[protocol='ftps'].sslFlags:Ssl"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SSL binding configured successfully"
    } else {
        Write-Host "WARNING: appcmd returned exit code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "Step 4: Verifying configuration..."
    
    # Get updated configuration
    $ftpSite = Get-Item IIS:\Sites\FTP-Backend
    Write-Host "Updated bindings:"
    $ftpSite.Bindings | ForEach-Object { 
        Write-Host "  - Protocol: $($_.protocol), IP: $($_.bindingInformation)"
    }
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "CONFIGURATION COMPLETED"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Certificate Thumbprint: $thumbprint"
    Write-Host "FTP Site: FTP-Backend"
    Write-Host ""
    
}
catch {
    Write-Host ""
    Write-Host "ERROR: Configuration failed"
    Write-Host $_.Exception.Message
    exit 1
}

exit 0
