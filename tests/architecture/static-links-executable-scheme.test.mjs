import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const script = join(repoRoot, "scripts/check-static-links.mjs");
const fixtures = join(repoRoot, "tests/fixtures");

// The checker hardcodes `<cwd>/dist`, and `dist/` is gitignored, so the
// fixture pages live beside it and are staged into a temp dist/ at runtime.
function stageFixture(name, pages) {
  const root = mkdtempSync(join(tmpdir(), `static-links-${name}-`));
  const dist = join(root, "dist");
  mkdirSync(dist, { recursive: true });
  for (const [source, target] of pages) {
    const dest = join(dist, target);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(fixtures, source), dest);
  }
  return root;
}

function runChecker(cwd) {
  return spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
}

// Issue #377: the checker silently skipped javascript: URLs. Executable
// navigation schemes must fail with the page, URL and scheme.
test("static link checker rejects executable URL schemes", () => {
  const cwd = stageFixture("executable-scheme", [
    ["static-links-executable-scheme/index.html", "index.html"],
  ]);
  const result = runChecker(cwd);
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
  const cwd = stageFixture("legitimate", [
    ["static-links-legitimate/index.html", "index.html"],
    ["static-links-legitimate/other.html", `other${sep}index.html`],
  ]);
  const result = runChecker(cwd);
  const report = JSON.parse(result.stdout);
  assert.equal(result.status, 0);
  assert.equal(report.status, "PASS");
  assert.equal(report.brokenCount, 0);
  assert.equal(report.externalSkipped, 1);
});
