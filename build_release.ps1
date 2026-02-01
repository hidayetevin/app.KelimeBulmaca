# Quick Build Script for Production Release

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kelime Ustasi - Production Build" -ForegroundColor Cyan
Write-Host "  Version: 1.0.3 (Code: 3)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean build
Write-Host "[1/4] Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Dist folder cleaned" -ForegroundColor Green
}

# Step 2: Build web app
Write-Host ""
Write-Host "[2/4] Building web app (TypeScript + Vite)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web build completed" -ForegroundColor Green

# Step 3: Sync with Capacitor
Write-Host ""
Write-Host "[3/4] Syncing with Android (Capacitor)..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Android sync completed" -ForegroundColor Green

# Step 4: Open Android Studio
Write-Host ""
Write-Host "[4/4] Opening Android Studio..." -ForegroundColor Yellow
npx cap open android

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. In Android Studio: Build > Generate Signed Bundle/APK" -ForegroundColor White
Write-Host "2. Select: Android App Bundle (.aab)" -ForegroundColor White
Write-Host "3. Choose keystore: upload-keystore.jks" -ForegroundColor White
Write-Host "4. Password: kelimeustasi123" -ForegroundColor White
Write-Host "5. Output: android/app/release/app-release.aab" -ForegroundColor White
Write-Host ""
Write-Host "Don't forget to update AdMob Console settings!" -ForegroundColor Yellow
Write-Host "See: Docs/Google_Play_Policy_Duzeltmeleri.md" -ForegroundColor Yellow
