/**
 * WP-12 (LSN-marketing-002): pure stamp comparison, unit-tested in
 * tests/architecture/build-stamp.test.mjs.
 * Returns an error message when the local build must be refused, else null.
 */
export function checkStamp(stamped, head) {
  if (stamped === null) {
    return ".astro/build-commit is missing: run `pnpm build` before local Playwright.";
  }
  if (stamped !== head) {
    return `The build was made from ${stamped}, HEAD is ${head}: run \`pnpm build\`.`;
  }
  return null;
}

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/**
 * LSN-marketing-002 (recurrence 2026-10-24): a loopback PLAYWRIGHT_BASE_URL
 * skips the webServer, so the run is only a local evidence lane when the URL
 * points at this machine. Returns an error message, or null when allowed.
 */
export function checkLaneURL(baseURL) {
  let host;
  try {
    host = new URL(baseURL).hostname;
  } catch {
    return `PLAYWRIGHT_BASE_URL is not a valid URL: ${baseURL}`;
  }
  const bare = host.startsWith("[") ? host : host.toLowerCase();
  if (!LOOPBACK_HOSTS.has(bare)) {
    return `remote base URL is not a local evidence lane: ${baseURL} (local runs accept only 127.0.0.1 or localhost).`;
  }
  return null;
}

/**
 * The commit the SERVED build reports at /.well-known/build-commit, compared
 * with HEAD. This verifies the build the browser will see, not just dist/.
 */
export function checkServedCommit(served, head) {
  if (served === null) {
    return "The server on PLAYWRIGHT_BASE_URL does not serve /.well-known/build-commit: it is not serving this worktree's build. Rebuild and restart your own `astro preview`.";
  }
  if (served !== head) {
    return `The server on PLAYWRIGHT_BASE_URL serves a build from ${served}, HEAD is ${head}: it is another worktree's preview.`;
  }
  return null;
}
