#!/usr/bin/env node
/**
 * Build the bilingual-parity fixture app before Playwright starts
 * (S+ v2 Task 0.2). Always rebuilds: the fixture imports shared repository
 * components through the `@` alias, so any repo source change can change
 * the built output — an mtime-based skip produced false local failures
 * (and could hide regressions), so correctness wins over a few saved
 * seconds. Used by `pnpm test:e2e`; the spec keeps a lock-protected
 * fallback so bare `playwright test` runs work too.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const entry = join("tests/e2e/fixtures/parity-app/dist", "en", "index.html");
const ready = () =>
  existsSync(entry) && readFileSync(entry, "utf8").includes("</html>");

execSync("pnpm exec astro build --root tests/e2e/fixtures/parity-app", {
  stdio: "pipe",
});

if (!ready()) {
  console.error("Parity fixture build did not produce a complete dist");
  process.exit(1);
}

console.log("Parity fixture ready");
