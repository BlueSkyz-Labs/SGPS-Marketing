#!/usr/bin/env node
/**
 * Build the bilingual-parity fixture app once, before Playwright starts
 * (S+ v2 Task 0.2). Idempotent: skips the build when a complete dist exists.
 * Used by `pnpm test:e2e`; the spec keeps a lock-protected fallback so bare
 * `playwright test` runs work too.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const entry = join("tests/e2e/fixtures/parity-app/dist", "en", "index.html");
const ready = () =>
  existsSync(entry) && readFileSync(entry, "utf8").includes("</html>");

if (!ready()) {
  execSync("pnpm exec astro build --root tests/e2e/fixtures/parity-app", {
    stdio: "pipe",
  });
}

if (!ready()) {
  console.error("Parity fixture build did not produce a complete dist");
  process.exit(1);
}

console.log("Parity fixture ready");
