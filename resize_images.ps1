Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$InputPath,
        [int]$Width,
        [int]$Height
    )

    $srcImage = [System.Drawing.Image]::FromFile($InputPath)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $destImage = New-Object System.Drawing.Bitmap($Width, $Height)
    
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImage, $rect)
    
    $srcImage.Dispose()
    $graphics.Dispose()
    
    $destImage.Save($InputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    
    Write-Host "Resized $InputPath to ${Width}x${Height}"
}

# Resize 10-inch tablet screenshots to 1920x1080 (16:9)
$tabletImages = @(
    "Docs\store_assets\screenshot_tablet_10inch_1.png",
    "Docs\store_assets\screenshot_tablet_10inch_2.png",
    "Docs\store_assets\screenshot_tablet_10inch_3.png"
)

foreach ($img in $tabletImages) {
    if (Test-Path $img) {
        Resize-Image -InputPath (Resolve-Path $img) -Width 1920 -Height 1080
    } else {
        Write-Host "File not found: $img"
    }
}
