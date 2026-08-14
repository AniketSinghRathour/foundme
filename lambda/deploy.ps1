# deploy.ps1 - builds a Lambda-ready zip under the 250 MB uncompressed limit
# Usage: .\deploy.ps1
# Output: lambda.zip in this directory

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# Step 1 - Install all deps (postinstall runs prisma generate automatically)
# ---------------------------------------------------------------------------
Write-Host "`n[1/6] Installing deps (prisma generate runs via postinstall)..." -ForegroundColor Cyan
npm install

# ---------------------------------------------------------------------------
# Step 2 - Prune devDependencies.
# ---------------------------------------------------------------------------
Write-Host "`n[2/6] Pruning devDependencies..." -ForegroundColor Cyan
npm prune --omit=dev

# ---------------------------------------------------------------------------
# Step 3 - Install Linux-compatible Sharp binary.
# ---------------------------------------------------------------------------
Write-Host "`n[3/6] Installing Linux-compatible Sharp binary..." -ForegroundColor Cyan
if (Test-Path "node_modules/@img") { Remove-Item "node_modules/@img" -Recurse -Force }
npm install --os=linux --cpu=x64 --libc=glibc sharp --ignore-scripts --omit=dev --no-save

Write-Host "`n[3b/6] Verifying Linux Sharp binary landed..." -ForegroundColor Cyan
$sharpBin = Get-ChildItem "node_modules/@img" -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "sharp-linux-x64*" }
if (-not $sharpBin) {
    Write-Error "sharp-linux-x64 not found under node_modules/@img. Aborting."
    exit 1
}
Write-Host "  Found: $($sharpBin.Name)" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 4 - Remove Prisma CLI-only packages & bloat AFTER npm install commands run.
# This guarantees no npm command can reinstall deleted bloat.
# NOTE: node_modules/@img is intentionally NOT in this list.
# ---------------------------------------------------------------------------
Write-Host "`n[4/6] Removing Prisma CLI-only packages not needed at runtime..." -ForegroundColor Cyan

$bloatPaths = @(
    # Prisma CLI package itself - ~42 MB
    "node_modules/prisma",
    # Prisma Studio (GUI) - ~42 MB, pure dev tool
    "node_modules/@prisma/studio-core",
    # CLI binary engines (query-engine, migration-engine etc.) - ~21 MB
    # Not needed: we use the WASM query compiler embedded in @prisma/client/runtime
    "node_modules/@prisma/engines",
    # Prisma internal dev utilities - ~18 MB
    "node_modules/@prisma/dev",
    # Prisma fetch-engine (downloads engines) - ~2.5 MB, CLI only
    "node_modules/@prisma/fetch-engine",
    # Prisma streams-local - ~1.4 MB, CLI only
    "node_modules/@prisma/streams-local",
    # get-platform (used by CLI to pick engine binaries) - ~1.3 MB
    "node_modules/@prisma/get-platform",
    # effect - ~26 MB, pulled in by @prisma/config (CLI config parser)
    "node_modules/effect",
    # @electric-sql - ~24 MB, Prisma dev dependency
    "node_modules/@electric-sql",
    # elkjs - ~8 MB, Prisma Studio graph layout engine
    "node_modules/elkjs",
    # react-dom - ~7 MB, Prisma Studio UI
    "node_modules/react-dom",
    # @visx - ~1.1 MB, Prisma Studio charts
    "node_modules/@visx",
    # valibot - validation lib used by @prisma/config CLI
    "node_modules/valibot",
    # fast-check - property-based testing, Prisma dev dep
    "node_modules/fast-check",
    # remeda - functional utils, Prisma dev dep
    "node_modules/remeda",
    # lodash - pulled in by elkjs/studio
    "node_modules/lodash",
    # @types - all TypeScript type definitions, useless at runtime
    "node_modules/@types",
    # bestzip & rimraf - build tools not needed inside zip
    "node_modules/bestzip",
    "node_modules/rimraf",
    # Unused WASM runtimes - keep only postgresql (the one you use)
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.sqlserver.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.sqlserver.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.cockroachdb.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.cockroachdb.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.mysql.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.mysql.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.sqlite.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_fast_bg.sqlite.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.sqlserver.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.sqlserver.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.cockroachdb.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.cockroachdb.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.mysql.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.mysql.wasm-base64.mjs",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.sqlite.wasm-base64.js",
    "node_modules/@prisma/client/runtime/query_compiler_small_bg.sqlite.wasm-base64.mjs"
)

foreach ($p in $bloatPaths) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force
        Write-Host "  Removed: $p" -ForegroundColor DarkGray
    }
}

# ---------------------------------------------------------------------------
# Step 5 - Size check
# ---------------------------------------------------------------------------
Write-Host "`n[5/6] Checking uncompressed size..." -ForegroundColor Cyan

$includeItems = @("src", "node_modules", "prisma", "package.json")
$totalBytes = 0
foreach ($item in $includeItems) {
    if (Test-Path $item -PathType Container) {
        $totalBytes += (Get-ChildItem $item -Recurse -File | Measure-Object -Property Length -Sum).Sum
    } elseif (Test-Path $item -PathType Leaf) {
        $totalBytes += (Get-Item $item).Length
    }
}
$totalMB = [math]::Round($totalBytes / 1MB, 1)
Write-Host "  Uncompressed size: $totalMB MB" -ForegroundColor $(if ($totalMB -lt 250) { "Green" } else { "Red" })

if ($totalMB -ge 250) {
    Write-Error "Uncompressed size ($totalMB MB) exceeds the 250 MB Lambda limit. Aborting."
    exit 1
}

# ---------------------------------------------------------------------------
# Step 6 - Zip
# ---------------------------------------------------------------------------
Write-Host "`n[6/6] Creating lambda.zip..." -ForegroundColor Cyan

if (Test-Path "lambda.zip") { Remove-Item "lambda.zip" -Force }

$sevenZip = Get-Command "7z" -ErrorAction SilentlyContinue
if ($sevenZip) {
    & 7z a -tzip lambda.zip src node_modules node_modules\.prisma prisma package.json | Out-Null
} else {
    Compress-Archive -Path src, node_modules, node_modules\.prisma, prisma, package.json -DestinationPath lambda.zip
}

$zipMB = [math]::Round((Get-Item lambda.zip).Length / 1MB, 1)
Write-Host "`n Done! lambda.zip is $zipMB MB (uncompressed was $totalMB MB)" -ForegroundColor Green
Write-Host "   Upload: Lambda console > indexPhoto > Code > Upload from > .zip file" -ForegroundColor Gray
