$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$localDir = "e:\kartik\my_resume\public\screenshots"
$artDir = "C:\Users\GIGABYTE i9\.gemini\antigravity\brain\4be56965-88d5-49aa-ad71-86ba6cec8a86\screenshots"

if (!(Test-Path $localDir)) {
    New-Item -ItemType Directory -Force -Path $localDir | Out-Null
}
if (!(Test-Path $artDir)) {
    New-Item -ItemType Directory -Force -Path $artDir | Out-Null
}

$targets = @(
    @{
        name = "project_downloads_view.png"
        url = "http://localhost:3000/projects/aura-os-spatial-web"
        size = "1920,1080"
    },
    @{
        name = "project_no_downloads_view.png"
        url = "http://localhost:3000/projects/pulseflow-cloud-analytics"
        size = "1920,1080"
    },
    @{
        name = "desktop_homepage_view.png"
        url = "http://localhost:3000"
        size = "1920,1080"
    },
    @{
        name = "mobile_homepage_view.png"
        url = "http://localhost:3000"
        size = "390,844"
    },
    @{
        name = "admin_login_portal.png"
        url = "http://localhost:3000/admin/login"
        size = "1440,900"
    }
)

foreach ($t in $targets) {
    $localFile = Join-Path $localDir $t.name
    Write-Host "Capturing $($t.name) at $($t.size)..."
    Start-Process $chrome -ArgumentList "--headless=new", "--screenshot=$localFile", "--window-size=$($t.size)", "--virtual-time-budget=4000", "--hide-scrollbars", $t.url -Wait
    if (Test-Path $localFile) {
        Copy-Item -Path $localFile -Destination (Join-Path $artDir $t.name) -Force
        Write-Host "Saved and copied $($t.name) successfully."
    } else {
        Write-Host "Failed to capture $($t.name)"
    }
}

Write-Host "All public captures complete!"
