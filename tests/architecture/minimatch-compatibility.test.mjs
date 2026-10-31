/**
 * Issue #715 — compatibility proof for CVE-2026-118764 mitigation.
 *
 * The only known minimatch 3.x consumer is a legacy Lighthouse CI toolchain
 * (chrome-launcher -> rimraf 3 -> glob 7). This test deliberately traverses
 * that real dependency chain rather than testing an unrelated root import.
 * It MUST fail if the forced minimatch 11 major breaks glob 7's API.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const fromTest = createRequire(import.meta.url);

test("legacy Lighthouse CI glob/rimraf chain remains compatible with the patched minimatch", () => {
  const fromLhci = createRequire(fromTest.resolve("@lhci/cli/package.json"));
  const fromChromeLauncher = createRequire(
    fromLhci.resolve("chrome-launcher/package.json"),
  );
  const fromRimraf = createRequire(
    fromChromeLauncher.resolve("rimraf/package.json"),
  );
  const glob = fromRimraf("glob");
  const { Minimatch } = fromRimraf("minimatch");

  assert.equal(typeof glob.sync, "function");
  assert.equal(typeof glob.hasMagic, "function");
  assert.equal(typeof Minimatch, "function");
  assert.equal(glob.hasMagic("tests/architecture/*.test.mjs"), true);

  const found = glob.sync("tests/architecture/*.test.mjs", { nodir: true });
  assert.ok(
    found.includes("tests/architecture/tooling-vulnerabilities.test.mjs"),
    "glob@7 must still resolve a real architecture test file",
  );
  const matcher = new Minimatch("tests/architecture/*.test.mjs");
  assert.equal(
    matcher.match("tests/architecture/tooling-vulnerabilities.test.mjs"),
    true,
  );
});
