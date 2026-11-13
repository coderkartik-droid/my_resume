<#
.SYNOPSIS
    Prepares a clean production deployment archive for cPanel / HostingRaja Node.js Hosting.
.DESCRIPTION
    Creates a deploy/my_resume_production.zip package containing:
    - Pre-built Next.js application (.next/) compiled locally (excluding cache/dev/diagnostics)
    - Source code (src/)
    - Public assets & uploaded media (public/) (excluding public/screenshots/)
    - Persistent storage directory structure and valid documents (storage/) (excluding mock .exe/.zip)
    - Prisma schema, migrations, seed (prisma/) WITHOUT dev.db or database backups
    - Production server entrypoint (server.js)
    - Production configuration files & .htaccess security rules
    
    Excludes: node_modules, .env, dev.db, temporary backups, test scripts, screenshots, and mock binaries.
#>

$ErrorActionPreference = "Stop"
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName
$deployDir = Join-Path $rootDir "deploy"
$stagingDir = Join-Path $deployDir "staging_clean"
$zipOutput = Join-Path $deployDir "my_resume_production.zip"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PRODUCTION ZERO-BUILD DEPLOYMENT PACKAGER              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Root Directory:    $rootDir"
Write-Host "Output Archive:    $zipOutput"

# 1. Clean previous staging
if (Test-Path $stagingDir) {
    Remove-Item -Path $stagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

# Verify pre-built .next exists
$nextDir = Join-Path $rootDir ".next"
if (-not (Test-Path $nextDir)) {
    Write-Host "`n[.next not found - building production bundle locally...]" -ForegroundColor Yellow
    npm run build
}

Write-Host "`n[1/5] Staging pre-built .next..." -ForegroundColor Yellow
$destNext = Join-Path $stagingDir ".next"
New-Item -ItemType Directory -Path $destNext -Force | Out-Null
Get-ChildItem -Path $nextDir | Where-Object { $_.Name -notin @('cache', 'dev', 'diagnostics') } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $destNext $_.Name) -Recurse -Force
}

Write-Host "`n[2/5] Staging application source, assets, and storage..." -ForegroundColor Yellow

# Copy src
Copy-Item -Path (Join-Path $rootDir "src") -Destination (Join-Path $stagingDir "src") -Recurse -Force

# Copy public (excluding screenshots cache)
$destPublic = Join-Path $stagingDir "public"
New-Item -ItemType Directory -Path $destPublic -Force | Out-Null
Get-ChildItem -Path (Join-Path $rootDir "public") | Where-Object { $_.Name -ne 'screenshots' } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $destPublic $_.Name) -Recurse -Force
}

# Copy storage (excluding mock .exe and mock .zip)
$destStorage = Join-Path $stagingDir "storage"
New-Item -ItemType Directory -Path $destStorage -Force | Out-Null
Copy-Item -Path (Join-Path $rootDir "storage") -Destination $stagingDir -Recurse -Force
Get-ChildItem -Path (Join-Path $destStorage "project-files") -Filter "*AuraOS-Desktop-Setup.exe" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -Path (Join-Path $destStorage "project-files") -Filter "*AuraOS-Source-Code.zip" -ErrorAction SilentlyContinue | Remove-Item -Force

# Ensure storage/music directory exists
$storageMusic = Join-Path $destStorage "music"
if (-not (Test-Path $storageMusic)) { New-Item -ItemType Directory -Path $storageMusic -Force | Out-Null }
Set-Content -Path (Join-Path $storageMusic ".gitkeep") -Value ""

# Copy prisma runtime requirements (strictly excluding database files)
$destPrisma = Join-Path $stagingDir "prisma"
New-Item -ItemType Directory -Path $destPrisma -Force | Out-Null
Copy-Item -Path (Join-Path $rootDir "prisma\schema.prisma") -Destination (Join-Path $destPrisma "schema.prisma") -Force
Copy-Item -Path (Join-Path $rootDir "prisma\seed.ts") -Destination (Join-Path $destPrisma "seed.ts") -Force
if (Test-Path (Join-Path $rootDir "prisma\migrations")) {
    Copy-Item -Path (Join-Path $rootDir "prisma\migrations") -Destination (Join-Path $destPrisma "migrations") -Recurse -Force
}

# Ensure backups directory exists
$destBackups = Join-Path $stagingDir "backups"
New-Item -ItemType Directory -Path $destBackups -Force | Out-Null
Set-Content -Path (Join-Path $destBackups ".gitkeep") -Value ""

Write-Host "`n[3/5] Staging root configuration files..." -ForegroundColor Yellow
$rootFiles = @(
    "server.js",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "next-env.d.ts",
    "eslint.config.mjs",
    ".htaccess",
    ".env.production.example",
    "README.md"
)
foreach ($f in $rootFiles) {
    $srcFile = Join-Path $rootDir $f
    if (Test-Path $srcFile) {
        Copy-Item -Path $srcFile -Destination (Join-Path $stagingDir $f) -Force
    }
}

Write-Host "`n[4/5] Enforcing database and secrets protection..." -ForegroundColor Yellow
# Verify no database files or secrets leaked into staging
$leakCheck = Get-ChildItem -Path $stagingDir -Recurse | Where-Object {
    $_.Extension -in @('.db', '.sqlite', '.bak') -or $_.Name -in @('.env', '.env.local', 'cookies.txt')
}
if ($leakCheck) {
    throw "Security check failed: database or secret file detected in staging!"
}
Write-Host "  [OK] No database files or environment secrets present in staging." -ForegroundColor Green

Write-Host "`n[5/5] Compressing production deployment archive..." -ForegroundColor Yellow
if (Test-Path $zipOutput) {
    Remove-Item -Path $zipOutput -Force
}
Compress-Archive -Path "$stagingDir\*" -DestinationPath $zipOutput -CompressionLevel Optimal -Force
Remove-Item -Path $stagingDir -Recurse -Force

if (Test-Path $zipOutput) {
    $zipSize = (Get-Item $zipOutput).Length / 1MB
    $hash = (Get-FileHash -Path $zipOutput -Algorithm SHA256).Hash
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "✓ CLEAN PRODUCTION ARCHIVE CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "  Location: $zipOutput" -ForegroundColor White
    Write-Host "  Size:     $([math]::Round($zipSize, 2)) MB" -ForegroundColor White
    Write-Host "  SHA256:   $hash" -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
}
