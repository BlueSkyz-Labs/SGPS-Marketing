import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const launcher = readFileSync("scripts/run-preview.mjs", "utf8");

test("local preview uses a persistent cross-platform launcher", () => {
  assert.equal(pkg.scripts.start, "node scripts/run-preview.mjs");
  assert.match(launcher, /astro/);
  assert.match(launcher, /127\.0\.0\.1/);
  assert.match(launcher, /fetch/);
  assert.match(launcher, /SIGTERM/);
});
