import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * WP-12 (LSN-marketing-002): refuse local Playwright runs against a stale dist/.
 * Runs ONLY when !process.env.CI. Reads dist/.build-commit (written by the
 * build-stamp integration) and compares with `git rev-parse HEAD`.
 * CI is unaffected: it builds fresh before testing.
 */
async function globalSetup() {
  if (process.env.CI) return;
  const stampPath = join(process.cwd(), "dist", ".build-commit");
  if (!existsSync(stampPath)) {
    throw new Error(
      "dist/.build-commit is missing: run `pnpm build` before local Playwright.",
    );
  }
  const stamped = readFileSync(stampPath, "utf8").trim();
  let head = "unknown";
  try {
    head = execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    // git unavailable: cannot verify; allow the run.
    return;
  }
  if (stamped !== head) {
    throw new Error(
      `dist/ was built from ${stamped}, HEAD is ${head}: run \`pnpm build\`.`,
    );
  }
}

export default globalSetup;
