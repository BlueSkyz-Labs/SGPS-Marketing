import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");

test("Lighthouse tooling graph excludes known high-severity traversal packages", () => {
  assert.equal(pkg.pnpm?.overrides?.tmp, "0.2.7");
  assert.equal(pkg.pnpm?.overrides?.lighthouse, "13.4.1");
  assert.doesNotMatch(lockfile, /\n\s*extract-zip@/);
  assert.doesNotMatch(lockfile, /\n\s*tmp@(?:0\.1\.|0\.2\.[0-6](?:\D|$))/);
});
