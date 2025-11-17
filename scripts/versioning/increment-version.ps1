# Script para incrementar version automaticamente
# Uso: .\increment-version.ps1 -Type "patch|minor|major"

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("patch", "minor", "major")]
    [string]$Type = "patch"
)

# Leer version actual del package.json
$packageJson = Get-Content -Path "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version

Write-Host "Version actual: $currentVersion"

# Parsear version (semver: major.minor.patch)
$versionParts = $currentVersion -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]

# Incrementar segun tipo
switch ($Type) {
    "major" {
        $major++
        $minor = 0
        $patch = 0
        Write-Host "Incrementando version MAJOR"
    }
    "minor" {
        $minor++
        $patch = 0
        Write-Host "Incrementando version MINOR"
    }
    "patch" {
        $patch++
        Write-Host "Incrementando version PATCH"
    }
}

$newVersion = "$major.$minor.$patch"
Write-Host "Nueva version: $newVersion"

# Actualizar package.json
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path "package.json"

# Crear git tag
git tag -a "v$newVersion" -m "Release version $newVersion"

# Output para Jenkins
Write-Host "VERSION=$newVersion" | Out-File -FilePath "version.txt" -Encoding UTF8

Write-Host "[OK] Version actualizada a $newVersion"
exit 0
