$destDir = Join-Path $env:LOCALAPPDATA 'next-swc'
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$dest = Join-Path $destDir 'swc-win32-x64-msvc-14.2.33.tgz'
$url = 'https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-14.2.33.tgz'
$targetSize = 41491235

Remove-Item (Join-Path $destDir '*.temp*') -Force -ErrorAction SilentlyContinue

$retries = 0
while ($retries -lt 30) {
    $currentSize = 0
    if (Test-Path $dest) {
        $currentSize = (Get-Item $dest).Length
    }
    if ($currentSize -eq $targetSize) {
        Write-Output "SWC tarball download verified: $currentSize bytes."
        break
    }
    if ($currentSize -gt $targetSize) {
        Write-Output "File size exceeded, removing corrupted file..."
        Remove-Item $dest -Force
        $currentSize = 0
    }
    Write-Output "Downloading SWC ($currentSize / $targetSize bytes)..."
    & curl.exe -C - -fL --retry 3 --retry-delay 1 --connect-timeout 10 -o $dest $url
    $retries++
    Start-Sleep -Milliseconds 500
}

if ((Get-Item $dest).Length -eq $targetSize) {
    Write-Output "Extracting tarball to node_modules\@next\swc-win32-x64-msvc..."
    $targetDir = Join-Path $PSScriptRoot '..\node_modules\@next\swc-win32-x64-msvc'
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    tar -xzf $dest -C $targetDir --strip-components 1
    Write-Output "Extraction complete!"
    Get-ChildItem $targetDir | Select-Object Name, Length
} else {
    Write-Error "Failed to download complete file after $retries attempts."
}

