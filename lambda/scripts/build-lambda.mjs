// scripts/build-lambda.mjs
// Cross-platform Lambda deploy build script — runs via `npm run deploy`
// No PowerShell, no shell scripts. Works on Windows, macOS, Linux.
//
// What it does:
//   1. npm install (prisma generate runs via postinstall hook)
//   2. npm prune --omit=dev (prune devDependencies)
//   3. Install Linux-compatible Sharp binary (--ignore-scripts --omit=dev --no-save)
//   4. Remove Prisma CLI-only packages & bloat AFTER npm install (saves ~200 MB)
//   5. Size check — abort if uncompressed > 250 MB Lambda limit
//   6. Create lambda.zip

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function run(cmd) {
  console.log(`\n  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT });
}

function rmrf(p) {
  const full = path.join(ROOT, p);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`  Removed: ${p}`);
  }
}

function dirSizeBytes(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Step 1 — Install deps (postinstall runs prisma generate automatically)
// ---------------------------------------------------------------------------
console.log("\n[1/6] Installing deps (prisma generate runs via postinstall)...");
run("npm install");

// Dynamically import bestzip into memory now that npm install has guaranteed its existence
const { zip } = await import("bestzip");

// ---------------------------------------------------------------------------
// Step 2 — Prune devDependencies
// ---------------------------------------------------------------------------
console.log("\n[2/6] Pruning devDependencies...");
run("npm prune --omit=dev");

// ---------------------------------------------------------------------------
// Step 3 — Install Linux-compatible Sharp binary.
// ---------------------------------------------------------------------------
console.log("\n[3/6] Installing Linux-compatible Sharp binary...");
rmrf("node_modules/@img");
run("npm install --os=linux --cpu=x64 --libc=glibc sharp --ignore-scripts --omit=dev --no-save");

console.log("\n[3b/6] Verifying Linux Sharp binary landed...");
const imgDir = path.join(ROOT, "node_modules/@img");
const sharpLinuxBinary = fs.existsSync(imgDir)
  ? fs.readdirSync(imgDir).find((name) => name.startsWith("sharp-linux-x64"))
  : null;

if (!sharpLinuxBinary) {
  console.error(
    "\n❌ sharp-linux-x64 binary not found under node_modules/@img after install.\n" +
      "   Aborting before packaging a broken zip. Check npm output above for errors."
  );
  process.exit(1);
}
console.log(`  Found: ${sharpLinuxBinary}`);

// ---------------------------------------------------------------------------
// Step 4 — Remove Prisma CLI-only bloat & unwanted deps AFTER npm commands run.
//           This ensures no npm command can reinstall deleted bloat.
// ---------------------------------------------------------------------------
console.log("\n[4/6] Removing Prisma CLI-only packages not needed at runtime...");

const bloat = [
  // Prisma CLI package itself — ~42 MB
  "node_modules/prisma",
  // Prisma Studio GUI — ~42 MB
  "node_modules/@prisma/studio-core",
  // CLI binary engines — ~21 MB (we use WASM compiler in @prisma/client/runtime instead)
  "node_modules/@prisma/engines",
  // Prisma internal dev utils — ~18 MB
  "node_modules/@prisma/dev",
  // Engine downloader — ~2.5 MB, CLI only
  "node_modules/@prisma/fetch-engine",
  // CLI-only local streaming utils — ~1.4 MB
  "node_modules/@prisma/streams-local",
  // Platform detection for engine binaries — ~1.3 MB, CLI only
  "node_modules/@prisma/get-platform",
  // effect — ~26 MB, pulled in by @prisma/config (CLI config parser)
  "node_modules/effect",
  // @electric-sql — ~24 MB, Prisma dev dep
  "node_modules/@electric-sql",
  // elkjs — ~8 MB, Prisma Studio graph layout
  "node_modules/elkjs",
  // react-dom — ~7 MB, Prisma Studio UI
  "node_modules/react-dom",
  // @visx — ~1.1 MB, Prisma Studio charts
  "node_modules/@visx",
  // valibot — validation used only by @prisma/config CLI
  "node_modules/valibot",
  // fast-check — property testing, Prisma dev dep
  "node_modules/fast-check",
  // remeda — functional utils, Prisma dev dep
  "node_modules/remeda",
  // lodash — pulled in by elkjs/studio
  "node_modules/lodash",
  // @types — TypeScript definitions, useless at runtime
  "node_modules/@types",
  // bestzip & rimraf — build tools not needed inside zip
  "node_modules/bestzip",
  "node_modules/rimraf",
  // Non-postgresql WASM runtimes — keep only postgresql (~37 MB saved)
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
  "node_modules/@prisma/client/runtime/query_compiler_small_bg.sqlite.wasm-base64.mjs",
];

for (const p of bloat) rmrf(p);

// ---------------------------------------------------------------------------
// Step 5 — Size check
// ---------------------------------------------------------------------------
console.log("\n[5/6] Checking uncompressed size...");

const includeDirs = ["src", "node_modules", "prisma"];
let totalBytes = 0;
for (const d of includeDirs) totalBytes += dirSizeBytes(path.join(ROOT, d));
totalBytes += fs.statSync(path.join(ROOT, "package.json")).size;

const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
const ok = totalBytes < 250 * 1024 * 1024;
console.log(`  Uncompressed size: ${totalMB} MB ${ok ? "✅" : "❌ OVER LIMIT"}`);

if (!ok) {
  console.error(`\nAborting: ${totalMB} MB exceeds the 250 MB Lambda limit.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 6 — Zip
// ---------------------------------------------------------------------------
console.log("\n[6/6] Creating lambda.zip...");

const zipPath = path.join(ROOT, "lambda.zip");
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

await zip({
  source: ["src/*", "node_modules/*", "node_modules/.prisma/*", "prisma/*", "package.json"],
  destination: zipPath,
  cwd: ROOT,
});

const zipMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`\n✅ Done! lambda.zip is ${zipMB} MB compressed (${totalMB} MB uncompressed)`);
console.log("   Direct upload works (< 50 MB) — Lambda console > indexPhoto > Code > Upload from > .zip");
