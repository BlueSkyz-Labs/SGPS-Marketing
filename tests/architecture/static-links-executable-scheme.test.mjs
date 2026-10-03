import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const script = join(repoRoot, "scripts/check-static-links.mjs");

function runChecker(fixture) {
  return spawnSync(process.execPath, [script], {
    cwd: join(repoRoot, "tests/fixtures", fixture),
    encoding: "utf8",
  });
}

// Issue #377: the checker silently skipped javascript: URLs. Executable
// navigation schemes must fail with the page, URL and scheme.
test("static link checker rejects executable URL schemes", () => {
  const result = runChecker("static-links-executable-scheme");
  assert.notEqual(result.status, 0, "checker must fail on executable schemes");
  const report = JSON.parse(result.stderr);
  assert.equal(report.brokenCount, 2);
  const details = report.broken.map((entry) => entry.detail).sort();
  assert.deepEqual(details, [
    "forbidden executable URL scheme: javascript:",
    "forbidden executable URL scheme: vbscript:",
  ]);
  for (const entry of report.broken) {
    assert.match(entry.page, /\.html$/);
    assert.ok(entry.url.length > 0);
  }
});

// Acceptance 4: legitimate external/internal/data links still pass and the
// external counter is preserved.
test("static link checker still passes legitimate links", () => {
  const result = runChecker("static-links-legitimate");
  const report = JSON.parse(result.stdout);
  assert.equal(result.status, 0);
  assert.equal(report.status, "PASS");
  assert.equal(report.brokenCount, 0);
  assert.equal(report.externalSkipped, 1);
});
