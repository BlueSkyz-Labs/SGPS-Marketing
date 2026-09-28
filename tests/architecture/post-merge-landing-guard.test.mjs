import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import test from "node:test";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = "scripts/verify-post-merge-landing.mjs";
const FIXTURE_ENV = { ...process.env };
for (const key of [
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_PREFIX",
]) {
  delete FIXTURE_ENV[key];
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

const MAIN_SHA = git(["rev-parse", "origin/main"]);

// Historical incident: the orphaned PR #248 merge commit
// dcfb121775435112290b3b9501ee1b25911aed92 (parent 36a5512, branch of PR #237,
// never on main). Test (b) reproduces that shape in a throwaway repository.

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

test("(b) an orphaned merge commit (PR #248 class) fails loudly", () => {
  // Hermetic fixture: the historical PR #248 merge commit (above)
  // is not reachable from main, so a fresh clone does not contain it and the
  // regression silently depended on local object state. Rebuild the same
  // shape in a throwaway repository: a merge-like commit whose parent is on
  // main but which main never reached.
  const dir = mkdtempSync(join(tmpdir(), "post-merge-orphan-"));
  try {
    const g = (args) =>
      execFileSync("git", args, {
        cwd: dir,
        encoding: "utf8",
        env: {
          ...FIXTURE_ENV,
          GIT_AUTHOR_NAME: "fixture",
          GIT_AUTHOR_EMAIL: "fixture@example.invalid",
          GIT_COMMITTER_NAME: "fixture",
          GIT_COMMITTER_EMAIL: "fixture@example.invalid",
        },
      }).trim();
    g(["init", "-q", "-b", "main"]);
    g(["commit", "-q", "--allow-empty", "-m", "base"]);
    g(["update-ref", "refs/remotes/origin/main", "HEAD"]);
    g(["checkout", "-q", "-b", "pr-branch"]);
    g(["commit", "-q", "--allow-empty", "-m", "orphaned merge"]);
    const orphan = g(["rev-parse", "HEAD"]);

    assert.equal(
      spawnSync(
        "git",
        ["-C", dir, "merge-base", "--is-ancestor", orphan, "origin/main"],
        { env: FIXTURE_ENV },
      ).status,
      1,
      "fixture must be an orphan for this regression",
    );
    const r = spawnSync(
      process.execPath,
      [resolve(ROOT, SCRIPT), "--merge-commit", orphan, "--ref", "origin/main"],
      { cwd: dir, encoding: "utf8", env: FIXTURE_ENV },
    );
    assert.equal(r.status, 1, "guard must fail loudly for an orphaned merge");
    assert.ok(
      r.stderr.includes("POST-MERGE LANDING VERIFICATION FAILED LOUDLY"),
      `expected loud failure, got stderr: ${r.stderr}`,
    );
    assert.ok(r.stderr.includes(orphan), `stderr must cite commit`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
