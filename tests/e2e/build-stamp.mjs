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
