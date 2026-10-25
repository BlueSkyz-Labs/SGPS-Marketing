import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { checkLaneURL, checkServedCommit, checkStamp } from "./build-stamp.mjs";

/**
 * WP-12 (LSN-marketing-002): refuse local Playwright runs against a stale or
 * foreign build. Runs ONLY when !process.env.CI, and regardless of
 * PLAYWRIGHT_BASE_URL (which skips the webServer step):
 *  1. a base URL must be loopback, else the run is not a local evidence lane;
 *  2. .astro/build-commit (written by the build-stamp integration) must equal
 *     `git rev-parse HEAD`;
 *  3. when this worktree's dist/ carries .well-known/build-commit, the server
 *     answering on the base URL must report the same commit.
 * Boundary: if dist/ has no served stamp (built under CI or by an older
 * config) only the local .astro stamp is verified. CI is unaffected.
 */
async function globalSetup() {
  if (process.env.CI) return;
  const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim();
  if (baseURL) {
    const laneError = checkLaneURL(baseURL);
    if (laneError) throw new Error(laneError);
  }
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

  const servedStamp = join(
    process.cwd(),
    "dist",
    ".well-known",
    "build-commit",
  );
  if (baseURL && existsSync(servedStamp)) {
    let served = null;
    try {
      const res = await fetch(
        // astro preview uses trailingSlash: "always", so only the slash form answers.
        new URL(".well-known/build-commit/", baseURL),
        {
          signal: AbortSignal.timeout(5000),
        },
      );
      if (res.ok) served = (await res.text()).trim();
    } catch {
      // unreachable server: reported below as not serving this build.
    }
    const servedError = checkServedCommit(served, head);
    if (servedError) throw new Error(servedError);
  }
}

export default globalSetup;
