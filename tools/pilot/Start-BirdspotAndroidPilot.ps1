#requires -Version 5.1
<#
Birdspot Library S1: local Windows / Android physical pilot.
Pins the public GitHub release-candidate branch to an exact commit SHA.
No GitHub writes, no deploy, no user-data deletion, and no device access
unless -ConnectUsb is explicitly supplied.
#>
[CmdletBinding()]
param(
    [switch]$PrepareOnly,
    [switch]$ConnectUsb,
    [switch]$SelfCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoUrl = 'https://github.com/saddamsmit-source/Birdspot-Library.git'
$CandidateBranch = 'qa/birdspot-release-candidate-1.27.7-20261113'
$ExpectedSha = '83c117447126b705cae1899f71e66d070a6084b9'
$ExpectedVersion = '1.27.7'
$Port = 8765

function Assert-Tool([string]$Name) {
    $found = Get-Command -Name $Name -ErrorAction SilentlyContinue
    if ($null -eq $found) { throw "Required tool '$Name' is not installed or not on PATH." }
    return $found
}

function Check-LastExit([string]$Operation) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Operation failed (exit $LASTEXITCODE); preserving existing files. No release action taken."
    }
}

if ($SelfCheck) {
    if ($ExpectedSha -notmatch '^[0-9a-f]{40}$') { throw 'Pinned commit must be exactly 40 hex characters.' }
    if ($ExpectedVersion -ne '1.27.7') { throw 'Unexpected candidate version.' }
    if ($CandidateBranch -ne 'qa/birdspot-release-candidate-1.27.7-20261113') { throw 'Unexpected test branch.' }
    if ($Port -ne 8765) { throw 'Unexpected local test port.' }
    Write-Output 'PASS: pinned SHA, version and port; self-check made no network or filesystem changes.'
    exit 0
}

Assert-Tool 'git' | Out-Null
$root = [Environment]::GetFolderPath('LocalApplicationData')
if ([string]::IsNullOrWhiteSpace($root)) {
    throw 'No local application-data folder found. Refusing to use a shared or unknown location.'
}
$pilotRoot = Join-Path $root 'Birdspot-Pilot'
$checkout = Join-Path $pilotRoot ('source-' + $ExpectedSha.Substring(0, 12))
if (-not (Test-Path -LiteralPath $pilotRoot)) {
    New-Item -ItemType Directory -Path $pilotRoot -ErrorAction Stop | Out-Null
}

if (-not (Test-Path -LiteralPath $checkout)) {
    Write-Output 'Downloading the read-only, exact-version candidate into a separate local checkout...'
    & git clone --depth 1 --single-branch --branch $CandidateBranch $RepoUrl $checkout
    Check-LastExit 'Git clone'
}
if (-not (Test-Path -LiteralPath (Join-Path $checkout '.git'))) {
    throw 'An existing checkout path is not a Git repository. Refusing to overwrite it.'
}
$actualRemote = [string]((& git -C $checkout remote get-url origin | Select-Object -First 1))
Check-LastExit 'Git remote check'
if ($actualRemote.Trim() -ne $RepoUrl) { throw 'Existing checkout has an unexpected remote. Refusing to reuse it.' }
$actualSha = [string]((& git -C $checkout rev-parse HEAD | Select-Object -First 1))
Check-LastExit 'Git HEAD check'
if ($actualSha.Trim() -ne $ExpectedSha) {
    throw "Source HEAD $actualSha differs from pinned candidate $ExpectedSha. STOP — do not test an unverified version."
}
$dirty = @(& git -C $checkout status --porcelain)
Check-LastExit 'Checkout cleanliness check'
if ($dirty.Count -ne 0) { throw 'Local source checkout was changed. Refusing to run modified application code.' }

# Extract a new, clean snapshot. The HTTP server must NOT expose .git files.
$id = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
$site = Join-Path $pilotRoot ('site-' + $id)
$archive = Join-Path $pilotRoot ('snapshot-' + $id + '.zip')
New-Item -ItemType Directory -Path $site -ErrorAction Stop | Out-Null
& git -C $checkout archive --format=zip "--output=$archive" HEAD
Check-LastExit 'Create clean Git snapshot'
Expand-Archive -LiteralPath $archive -DestinationPath $site -ErrorAction Stop
Remove-Item -LiteralPath $archive -Force  # Only our own temporary archive
if (Test-Path -LiteralPath (Join-Path $site '.git')) { throw 'Refusing to serve a folder containing Git metadata.' }
if (-not (Test-Path -LiteralPath (Join-Path $site 'index.html'))) { throw 'Birdspot index.html missing.' }
$worker = Join-Path $site 'sw.js'
if (-not (Test-Path -LiteralPath $worker)) { throw 'Birdspot service worker missing.' }
$sw = Get-Content -LiteralPath $worker -Raw
if (-not $sw.Contains("const APP_VERSION = '$ExpectedVersion';")) {
    throw 'The extracted service worker does not contain the expected cache version.'
}
Write-Output "VERIFIED: candidate $ExpectedSha / APP_VERSION $ExpectedVersion"
Write-Output "Private local test folder: $site"
Write-Output 'Personal data and screenshots must stay outside the public GitHub repository.'
Write-Output 'Use ONLY fictitious sightings, harmless test images and non-sensitive locations.'

if ($PrepareOnly) {
    Write-Output 'PREPARED ONLY. No server started and no Android device contacted.'
    exit 0
}

$python = Get-Command -Name 'py' -ErrorAction SilentlyContinue
if ($null -ne $python) {
    $pythonArgs = @('-3', '-m', 'http.server', "$Port", '--bind', '127.0.0.1')
} else {
    $python = Assert-Tool 'python'
    $pythonArgs = @('-m', 'http.server', "$Port", '--bind', '127.0.0.1')
}
# Fail before starting a server if the localhost port is already occupied.
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
try {
    $listener.Start()
} catch {
    throw "Local port $Port is already occupied. Stop that server first; do not expose Birdspot on a public interface."
} finally {
    $listener.Stop()
}

$adbReverseSet = $false
if ($ConnectUsb) {
    Assert-Tool 'adb' | Out-Null
    $deviceList = @(& adb devices)
    Check-LastExit 'ADB device inspection'
    $authorized = @($deviceList | Where-Object { $_ -match '^\S+\s+device\s*$' })
    if ($authorized.Count -ne 1) {
        throw "Expected exactly one USB-debugging-authorized Android device; found $($authorized.Count). No device setting changed."
    }
    & adb reverse "tcp:$Port" "tcp:$Port" | Out-Null
    Check-LastExit 'ADB localhost reverse forwarding'
    $adbReverseSet = $true
    Write-Output 'USB port forwarding established for one authorized device.'
} else {
    Write-Output "ADB not touched. To connect a device in a second terminal: adb reverse tcp:$Port tcp:$Port"
}

Write-Output ''
Write-Output "Open Android Chrome at http://localhost:$Port/"
Write-Output 'First save a harmless fake sighting online; then disconnect USB and turn off Wi-Fi/mobile data.'
Write-Output 'Reopen Birdspot OFFLINE, save another fake sighting, check Android Back, and export a test ZIP.'
Write-Output 'Do not erase existing app data; capture any results privately with the Android evidence report.'
Write-Output 'Press Ctrl+C in this terminal when you finish; this local server never deploys anything.'
Write-Output ''

Push-Location -LiteralPath $site
try {
    & $python.Source @pythonArgs
    Check-LastExit 'Local-only Python HTTP server'
} finally {
    Pop-Location
    if ($adbReverseSet) {
        try {
            & adb reverse --remove "tcp:$Port" | Out-Null
        } catch {
            Write-Warning 'USB may be disconnected; remove forwarding manually when the device is reconnected.'
        }
    }
    Write-Output 'Local pilot server stopped. No user storage or GitHub branch was modified.'
}
