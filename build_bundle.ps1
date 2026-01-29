$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Set-Location "$PSScriptRoot\android"
Write-Host "Cleaning and Building Release Bundle..."
./gradlew clean bundleRelease --stacktrace
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! Bundle created at:" -ForegroundColor Green
    Write-Host "$PSScriptRoot\android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Build Failed!" -ForegroundColor Red
}
