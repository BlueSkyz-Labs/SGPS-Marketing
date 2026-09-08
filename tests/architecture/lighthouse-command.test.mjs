import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const launcher = readFileSync("scripts/run-lighthouse.mjs", "utf8");

test("Lighthouse uses a cross-platform repository launcher", () => {
  assert.equal(pkg.scripts.lighthouse, "node scripts/run-lighthouse.mjs");
  assert.doesNotMatch(pkg.scripts.lighthouse, /PUBLIC_SITE_URL=/);
  assert.match(launcher, /PUBLIC_SITE_URL/);
  assert.match(launcher, /process\.platform/);
  assert.match(launcher, /shell: process\.platform === "win32"/);
  assert.match(launcher, /pnpm/);
  assert.match(launcher, /lhci/);
});
