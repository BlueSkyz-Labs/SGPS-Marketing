import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");

const lockedVersions = (name) =>
  [...lockfile.matchAll(new RegExp(`^  ${name}@([^:]+):$`, "gm"))].map(
    ([, version]) => version,
  );

test("Lighthouse tooling graph excludes known traversal and resource-exhaustion advisories", () => {
  assert.match(workspace, /overrides:/);
  assert.match(workspace, /\n\s+tmp: 0\.2\.7/);
  assert.match(workspace, /\n\s+lighthouse: 13\.4\.1/);
  assert.match(workspace, /\n\s+uuid: 11\.1\.1/);
  assert.match(workspace, /\n\s+qs: 6\.16\.0/);

  assert.doesNotMatch(lockfile, /\n\s*extract-zip@/);
  assert.doesNotMatch(lockfile, /\n\s*tmp@(?:0\.1\.|0\.2\.[0-6](?:\D|$))/);
  assert.deepEqual(lockedVersions("uuid"), ["11.1.1"]);
  assert.deepEqual(lockedVersions("qs"), ["6.16.0"]);
});
