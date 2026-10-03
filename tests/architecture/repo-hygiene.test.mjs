/**
 * Public-repository hygiene guard.
 *
 * Local execution logs at repository root are not durable evidence and may
 * expose workstation paths, environment versions, traces or future secrets.
 * Durable evidence belongs under docs/evidence or another reviewed source path.
 */
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import test from "node:test";

export function isForbiddenRootArtifact(name) {
  return typeof name === "string" && /\.log$/i.test(name);
}

test("repository root contains no local execution log artifacts", () => {
  const offenders = readdirSync(".")
    .filter((name) => isForbiddenRootArtifact(name))
    .sort();
  assert.deepEqual(offenders, []);
});

test("negative proof: synthetic root execution logs are rejected", () => {
  assert.equal(isForbiddenRootArtifact("tc.log"), true);
  assert.equal(isForbiddenRootArtifact(".pw-t4m.log"), true);
  assert.equal(isForbiddenRootArtifact("docs/evidence/readback.md"), false);
});
