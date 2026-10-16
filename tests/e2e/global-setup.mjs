import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { checkStamp } from "./build-stamp.mjs";

/**
 * WP-12 (LSN-marketing-002): refuse local Playwright runs against a stale build.
 * Runs ONLY when !process.env.CI. Reads .astro/build-commit (written by the
 * build-stamp integration) and compares it with `git rev-parse HEAD`.
 * CI is unaffected: it builds fresh before testing.
 */
async function globalSetup() {
  if (process.env.CI) return;
  const stampPath = join(process.cwd(), ".astro", "build-commit");
  const stamped = existsSync(stampPath)
    ? readFileSync(stampPath, "utf8").trim()
    : null;
  let head;
  try {
    head = execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    // git unavailable: cannot verify; allow the run (see LSN reuse_boundary).
    return;
  }
  const error = checkStamp(stamped, head);
  if (error) throw new Error(error);
}

export default globalSetup;
