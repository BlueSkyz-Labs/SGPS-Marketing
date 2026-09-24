import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import test from "node:test";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = "scripts/verify-post-merge-landing.mjs";

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

const MAIN_SHA = git(["rev-parse", "origin/main"]);

// The verified orphaned PR #248 merge commit (verified: parent=36a5512, branch of PR #237, not on main).
const ORPHAN_MERGE_SHA = "dcfb121775435112290b3b9501ee1b25911aed92";

function runScript(args = []) {
  return spawnSync(process.execPath, [resolve(ROOT, SCRIPT), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

test("(a) a commit on origin/main passes the guard", () => {
  const r = runScript(["--merge-commit", MAIN_SHA, "--ref", "origin/main"]);
  assert.equal(r.status, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  assert.ok(r.stdout.includes("PASS"));
  assert.ok(r.stdout.includes("ancestor of"));
});

test("(b) an orphaned merge commit (verified PR #248) fails loudly", () => {
  // Guard: this commit really is absent from main.
  assert.equal(
    spawnSync("git", [
      "-C",
      ROOT,
      "merge-base",
      "--is-ancestor",
      ORPHAN_MERGE_SHA,
      "origin/main",
    ]).status,
    1,
    "fixture must be an orphan for this regression",
  );
  const r = runScript([
    "--merge-commit",
    ORPHAN_MERGE_SHA,
    "--ref",
    "origin/main",
  ]);
  assert.equal(r.status, 1, "guard must fail loudly for an orphaned merge");
  assert.ok(
    r.stderr.includes("POST-MERGE LANDING VERIFICATION FAILED LOUDLY"),
    `expected loud failure, got stderr: ${r.stderr}`,
  );
  assert.ok(r.stderr.includes(ORPHAN_MERGE_SHA), `stderr must cite commit`);
});

test("(c) a missing --merge-commit fails loudly (no silent PASS)", () => {
  const r = runScript(["--ref", "origin/main"]);
  assert.equal(r.status, 1);
  assert.ok(
    r.stderr.includes("FAIL: --merge-commit is required"),
    `expected explicit failure, stderr: ${r.stderr}`,
  );
});

test("(d) the guard script has no network primitives", () => {
  // Read source and assert no network imports.
  const source = readFileSync(resolve(ROOT, SCRIPT), "utf8");
  for (const primitive of [
    "node:http",
    "node:https",
    "undici",
    "XMLHttpRequest",
    "WebSocket",
    "fetch(",
  ]) {
    assert.equal(
      source.includes(primitive),
      false,
      `guard must stay offline; found ${primitive}`,
    );
  }
  // Only argv-based git calls, no shell interpolation.
  assert.ok(source.includes('execFileSync("git"'), "guard must use argv git");
});
