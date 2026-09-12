import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  STATUS,
  verifyAncestry,
  verifyModelSourceEvidence,
  verifyPath,
  verifyRevision,
} from "../../scripts/verify-git-evidence.mjs";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = "scripts/verify-git-evidence.mjs";
const MODEL = "architecture/sgps-model.json";

/** SHA-shaped but not a real object: 40 hex chars, matches the old regex. */
const FAKE_REVISION = "0123456789abcdef0123456789abcdef01234567";

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

const HEAD = git(["rev-parse", "HEAD"]);
const HEAD_BLOB = git(["rev-parse", `HEAD:package.json`]);

test("(a) HEAD and a real path at HEAD verify PASS", () => {
  const revision = verifyRevision(HEAD, ROOT);
  assert.equal(revision.status, STATUS.PASS);

  const revisionByRef = verifyRevision("HEAD", ROOT);
  assert.equal(revisionByRef.status, STATUS.PASS);

  for (const path of ["package.json", "architecture/sgps-model.json", "src"]) {
    const result = verifyPath(HEAD, path, ROOT);
    assert.equal(result.status, STATUS.PASS, `${path} should resolve at HEAD`);
  }
});

test("(b) a SHA-shaped but nonexistent revision is never PASS", () => {
  // Guard the premise: this object really is absent from the clone.
  const probe = spawnSync(
    "git",
    ["cat-file", "-e", `${FAKE_REVISION}^{commit}`],
    {
      cwd: ROOT,
    },
  );
  assert.notEqual(probe.status, 0, "fixture revision must not exist locally");

  const result = verifyRevision(FAKE_REVISION, ROOT);
  assert.notEqual(
    result.status,
    STATUS.PASS,
    "unverifiable evidence must not pass",
  );
  assert.ok(
    result.status === STATUS.FAIL ||
      result.status === STATUS.SHALLOW_UNVERIFIED,
    `unexpected status ${result.status}`,
  );
  assert.ok(result.hint.length > 0, "non-pass results must carry a fix hint");
});

test("(c) a real revision with a bogus path FAILs", () => {
  const result = verifyPath(HEAD, "does/not/exist/at/this/revision.txt", ROOT);
  assert.equal(result.status, STATUS.FAIL);
  assert.match(result.detail, /does not exist/);
});

test("(d) the CLI exits 0 and prints the PASS summary on the real repo", () => {
  const run = spawnSync(process.execPath, [SCRIPT], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `stderr: ${run.stderr}`);
  assert.match(run.stdout, /Git evidence: PASS \(\d+ entries\)/);
  assert.doesNotMatch(run.stdout + run.stderr, /SHALLOW_UNVERIFIED/);
});

test("(e) the verifier contains no network primitives", () => {
  const source = readFileSync(resolve(ROOT, SCRIPT), "utf8");
  for (const primitive of [
    "node:http",
    "node:https",
    "node:net",
    "node:dns",
    "node:tls",
    "node:dgram",
    "undici",
    "XMLHttpRequest",
    "WebSocket",
    "fetch(",
    "execSync",
    "child_process.exec(",
  ]) {
    assert.equal(
      source.includes(primitive),
      false,
      `verifier must stay offline; found ${primitive}`,
    );
  }
  // Git access is argv-based only (no shell interpolation).
  assert.match(source, /execFileSync\("git", args/);
  assert.doesNotMatch(source, /shell:\s*true/);
});

test("negative: blob SHA used where a commit is required FAILs", () => {
  const result = verifyRevision(HEAD_BLOB, ROOT);
  assert.equal(result.status, STATUS.FAIL);
  assert.match(result.detail, /blob/);
});

test("negative: empty and traversal inputs FAIL before touching Git", () => {
  assert.equal(verifyRevision("", ROOT).status, STATUS.FAIL);
  assert.equal(verifyRevision("   ", ROOT).status, STATUS.FAIL);
  assert.equal(verifyRevision("-r", ROOT).status, STATUS.FAIL);
  assert.equal(verifyPath(HEAD, "", ROOT).status, STATUS.FAIL);
  assert.equal(verifyPath(HEAD, "../package.json", ROOT).status, STATUS.FAIL);
  assert.equal(verifyPath(HEAD, "/etc/passwd", ROOT).status, STATUS.FAIL);
  assert.equal(verifyPath("", "package.json", ROOT).status, STATUS.FAIL);
});

test("real model sourceEvidence resolves against local Git objects", () => {
  const model = JSON.parse(readFileSync(resolve(ROOT, MODEL), "utf8"));
  const report = verifyModelSourceEvidence(model, ROOT);

  assert.ok(report.passed.length > 0, "model should carry verifiable evidence");
  assert.deepEqual(
    report.failures.map((entry) => `${entry.subject} ${entry.detail}`),
    [],
  );
  assert.deepEqual(
    report.unverified.map((entry) => entry.subject),
    [],
  );
  // Every cited revision must resolve to a commit, not merely match a regex.
  for (const entry of report.passed) {
    assert.match(entry.revision, /^[0-9a-f]{40}$/);
  }
});

test("the verifier does not fabricate PASS for a tampered revision", () => {
  const model = JSON.parse(readFileSync(resolve(ROOT, MODEL), "utf8"));
  const tampered = structuredClone(model);
  const target = tampered.entities.find((entity) => entity.sourceEvidence);
  assert.ok(target, "fixture needs at least one sourceEvidence entity");
  target.sourceEvidence.revision = FAKE_REVISION;

  const report = verifyModelSourceEvidence(tampered, ROOT);
  assert.ok(report.failures.length > 0, "tampered revision must fail");
  assert.equal(
    report.passed.some((entry) => entry.revision === FAKE_REVISION),
    false,
  );
});

test("an unverifiable model never yields a PASS verdict", () => {
  // Model-level: no entries at all must not be counted as verified.
  const emptyReport = verifyModelSourceEvidence({ entities: [] }, ROOT);
  assert.equal(emptyReport.passed.length, 0);

  // CLI-level: exit code must not be 0 with a PASS summary.
  const dir = mkdtempSync(join(tmpdir(), "sgps-evidence-"));
  try {
    const modelPath = join(dir, "empty-model.json");
    writeFileSync(modelPath, JSON.stringify({ entities: [] }));
    const run = spawnSync(process.execPath, [SCRIPT, "--model", modelPath], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.notEqual(run.status, 0, "an empty model must not exit 0");
    assert.doesNotMatch(run.stdout + run.stderr, /Git evidence: PASS/);
    assert.match(run.stdout + run.stderr, /Git evidence: INCOMPLETE/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("verifyAncestry rejects a real commit orphaned from HEAD", () => {
  const root = mkdtempSync(join(tmpdir(), "git-evidence-ancestry-"));
  const git = (...args) =>
    execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();

  git("init", "-q");
  git("config", "user.email", "assurance@example.invalid");
  git("config", "user.name", "Source Assurance");
  writeFileSync(join(root, "a.txt"), "a\n");
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  git("checkout", "-q", "-b", "side");
  writeFileSync(join(root, "b.txt"), "b\n");
  git("add", "-A");
  git("commit", "-q", "-m", "side work");
  const orphan = git("rev-parse", "HEAD");
  git("checkout", "-q", "-");
  const ancestry = verifyAncestry(orphan, root);

  assert.equal(ancestry.status, "FAIL");
  assert.match(ancestry.detail, /not reachable/);
  assert.notEqual(ancestry.status, "PASS");
  rmSync(root, { recursive: true, force: true });
});
