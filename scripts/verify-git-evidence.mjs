#!/usr/bin/env node
/**
 * Git-object provenance verifier (finding F2).
 *
 * A SHA-shaped string is not evidence. Immutable Git evidence means Git itself
 * resolves BOTH the revision (to a commit object) and the cited path (at that
 * commit). This script is deterministic, offline and read-only: it never
 * fetches, never writes and never mutates a ref.
 *
 * Statuses
 *   PASS                Git resolved the object.
 *   FAIL                Git rejected the object, or the input was invalid.
 *   SHALLOW_UNVERIFIED  The object is absent in a shallow clone, so absence is
 *                       NOT evidence of anything. Never reported as PASS.
 *
 * All Git calls use execFileSync with an argument array (no shell), after
 * validating that the revision/path cannot be read as a flag or a traversal.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const STATUS = {
  PASS: "PASS",
  FAIL: "FAIL",
  SHALLOW_UNVERIFIED: "SHALLOW_UNVERIFIED",
};

export const DEFAULT_MODEL_PATH = "architecture/sgps-model.json";

const GIT_ENV = {
  ...process.env,
  GIT_TERMINAL_PROMPT: "0",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_PAGER: "cat",
};

/** Run git with an argv array. Returns { ok, stdout, status }. No shell. */
function runGit(args, cwd) {
  try {
    const stdout = execFileSync("git", args, {
      cwd,
      env: GIT_ENV,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, stdout: stdout.trim(), status: 0 };
  } catch (error) {
    return {
      ok: false,
      stdout: typeof error?.stdout === "string" ? error.stdout.trim() : "",
      status: typeof error?.status === "number" ? error.status : 1,
    };
  }
}

const shallowCache = new Map();

/** True when the checkout at `cwd` is shallow (history truncated). */
export function isShallowRepository(cwd = process.cwd()) {
  const key = resolve(cwd);
  if (shallowCache.has(key)) return shallowCache.get(key);
  const result = runGit(["rev-parse", "--is-shallow-repository"], cwd);
  const shallow = result.ok && result.stdout === "true";
  shallowCache.set(key, shallow);
  return shallow;
}

/**
 * Reject revisions that are empty, flag-shaped or revision-spec tricks.
 * We append `^{commit}` / `:path` ourselves, so `^`, `:` and friends are out.
 */
export function validateRevision(revision) {
  if (typeof revision !== "string" || revision === "") {
    return "revision is empty";
  }
  if (revision !== revision.trim()) {
    return "revision has leading or trailing whitespace";
  }
  if (revision.startsWith("-")) {
    return "revision must not start with '-' (flag injection)";
  }
  if (revision.includes("..")) {
    return "revision must not contain '..'";
  }
  if (/[\s~^:?*[\\]/.test(revision)) {
    return "revision contains unsupported revision-spec characters";
  }
  if (!/^[0-9A-Za-z][0-9A-Za-z._/-]*$/.test(revision)) {
    return "revision has an unsupported shape";
  }
  return null;
}

/** Reject paths that are empty, absolute, flag-shaped or traverse upward. */
export function validatePath(path) {
  if (typeof path !== "string" || path === "") {
    return "path is empty";
  }
  if (path !== path.trim()) {
    return "path has leading or trailing whitespace";
  }
  if (path.startsWith("-")) {
    return "path must not start with '-' (flag injection)";
  }
  if (path.startsWith("/") || /^[A-Za-z]:/.test(path)) {
    return "path must be repository-relative";
  }
  if (path.includes("\\")) {
    return "path must use forward slashes";
  }
  if (path.includes("\0")) {
    return "path contains a NUL byte";
  }
  if (path.split("/").some((segment) => segment === "..")) {
    return "path traversal ('..') is not allowed";
  }
  return null;
}

function failure(subject, revision, detail, hint, path) {
  return {
    status: STATUS.FAIL,
    subject,
    revision,
    path,
    detail,
    hint,
  };
}

function unverified(subject, revision, detail, hint, path) {
  return {
    status: STATUS.SHALLOW_UNVERIFIED,
    subject,
    revision,
    path,
    detail,
    hint,
  };
}

/** Object type at `revision`, or null when the object is absent. */
function objectType(revision, cwd) {
  const result = runGit(["cat-file", "-t", revision], cwd);
  return result.ok && result.stdout !== "" ? result.stdout : null;
}

const FETCH_HINT =
  "fetch the cited revision (actions/checkout fetch-depth: 0) or cite a revision reachable from the fetched history";

/**
 * Verify that `revision` resolves to a real commit object.
 * @returns {{status: string, subject: string, revision: string, detail: string, hint: string}}
 */
export function verifyRevision(revision, cwd = process.cwd()) {
  const subject = `revision ${String(revision)}`;
  const invalid = validateRevision(revision);
  if (invalid) {
    return failure(
      subject,
      revision,
      invalid,
      "pass a 40-hex commit SHA or a plain ref name",
    );
  }

  if (runGit(["cat-file", "-e", `${revision}^{commit}`], cwd).ok) {
    return {
      status: STATUS.PASS,
      subject,
      revision,
      detail: `${revision}^{commit} resolves`,
      hint: "",
    };
  }

  const type = objectType(revision, cwd);
  if (type && type !== "commit") {
    return failure(
      subject,
      revision,
      `resolves to a ${type} object, not a commit`,
      "cite the commit SHA that contains the path, not a blob/tree SHA",
    );
  }
  if (type === null && isShallowRepository(cwd)) {
    return unverified(
      subject,
      revision,
      "revision object is absent in a shallow clone — absence is not evidence",
      FETCH_HINT,
    );
  }
  return failure(
    subject,
    revision,
    "Git cannot resolve this revision to a commit object",
    "use a real commit SHA reachable from origin; a SHA-shaped string is not evidence",
  );
}

/**
 * Verify that `path` exists inside the tree of `revision`.
 * @returns {{status: string, subject: string, revision: string, path: string, detail: string, hint: string}}
 */
export function verifyPath(revision, path, cwd = process.cwd()) {
  const subject = `${String(revision)}:${String(path)}`;
  const invalidRevision = validateRevision(revision);
  if (invalidRevision) {
    return failure(
      subject,
      revision,
      invalidRevision,
      "pass a 40-hex commit SHA or a plain ref name",
      path,
    );
  }
  const invalidPath = validatePath(path);
  if (invalidPath) {
    return failure(
      subject,
      revision,
      invalidPath,
      "cite a repository-relative path without '..' or a leading '-'",
      path,
    );
  }

  const revisionResult = verifyRevision(revision, cwd);
  if (revisionResult.status !== STATUS.PASS) {
    return { ...revisionResult, subject, path };
  }

  if (runGit(["cat-file", "-e", `${revision}:${path}`], cwd).ok) {
    return {
      status: STATUS.PASS,
      subject,
      revision,
      path,
      detail: `path exists at ${revision}`,
      hint: "",
    };
  }
  return failure(
    subject,
    revision,
    `path does not exist at ${revision}`,
    "cite a path that exists in that commit's tree, or update the revision — do not rewrite history",
    path,
  );
}

/** Normalize `path` / `paths` (string or array) into a string array. */
export function normalizeEvidencePaths(evidence) {
  const raw = evidence?.paths ?? evidence?.path;
  if (raw === undefined || raw === null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * Local repository slug, e.g. "BlueSkyz-Labs/SGPS-Marketing".
 * Returns null when the origin is a local path / file:// URL, in which case
 * every entry is verified against the local object store (the safe default).
 */
export function detectLocalRepository(cwd = process.cwd()) {
  const result = runGit(["remote", "get-url", "origin"], cwd);
  if (!result.ok) return null;
  const url = result.stdout;

  const scp = url.match(/^[^@/\s]+@[^:\s]+:([^/\s]+\/[^/\s]+?)(?:\.git)?$/);
  if (scp) return scp[1];

  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "ssh:", "git:"].includes(parsed.protocol)) {
      return null;
    }
    const match = parsed.pathname
      .replace(/^\/+/, "")
      .match(/^([^/]+\/[^/]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function collectEvidenceEntries(model) {
  const entries = [];
  const push = (subject, evidence) => {
    if (evidence && typeof evidence === "object")
      entries.push({ subject, evidence });
  };
  push("model", model?.sourceEvidence);
  for (const [index, entity] of (model?.entities ?? []).entries()) {
    push(entity?.id ?? `entities[${index}]`, entity?.sourceEvidence);
  }
  for (const [index, relation] of (model?.relationships ?? []).entries()) {
    push(relation?.id ?? `relationships[${index}]`, relation?.sourceEvidence);
  }
  return entries;
}

/**
 * Verify every sourceEvidence record in an architecture model against local
 * Git objects.
 * @returns {{results: object[], passed: object[], failures: object[], unverified: object[], skipped: object[]}}
 */
export function verifyModelSourceEvidence(model, cwd = process.cwd()) {
  const localRepository = detectLocalRepository(cwd);
  const results = [];

  for (const { subject, evidence } of collectEvidenceEntries(model)) {
    const repository = evidence.repository;
    const revision = evidence.revision;

    if (
      localRepository &&
      typeof repository === "string" &&
      repository !== localRepository
    ) {
      results.push({
        status: "SKIPPED",
        subject,
        revision,
        path: "",
        detail: `repository ${repository} is not the local checkout (${localRepository})`,
        hint: "verify foreign-repository evidence in that repository's own pipeline",
      });
      continue;
    }

    const paths = normalizeEvidencePaths(evidence);
    if (paths.length === 0) {
      results.push(
        failure(
          subject,
          revision,
          "sourceEvidence declares neither path nor paths",
          "add the repository-relative path the revision is evidence for",
        ),
      );
      continue;
    }

    for (const path of paths) {
      results.push({ ...verifyPath(revision, path, cwd), subject });
    }
  }

  return {
    results,
    passed: results.filter((r) => r.status === STATUS.PASS),
    failures: results.filter((r) => r.status === STATUS.FAIL),
    unverified: results.filter((r) => r.status === STATUS.SHALLOW_UNVERIFIED),
    skipped: results.filter((r) => r.status === "SKIPPED"),
  };
}

/** Read and parse a model file. Throws with a precise message on failure. */
export function loadModel(modelPath, cwd = process.cwd()) {
  const absolute = resolve(cwd, modelPath);
  try {
    return JSON.parse(readFileSync(absolute, "utf8"));
  } catch (error) {
    throw new Error(`cannot read model ${modelPath}: ${error.message}`);
  }
}

export function formatReportLine(result) {
  return `${result.status} ${result.subject} \u2014 ${result.detail} (fix: ${result.hint})`;
}

function main(argv = process.argv.slice(2)) {
  let modelPath = DEFAULT_MODEL_PATH;
  let cwd = process.cwd();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--model") modelPath = argv[(i += 1)];
    else if (arg === "--cwd") cwd = argv[(i += 1)];
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "usage: node scripts/verify-git-evidence.mjs [--model <path>] [--cwd <dir>]",
      );
      return 0;
    } else {
      console.error(`unknown argument: ${arg}`);
      return 2;
    }
  }

  let model;
  try {
    model = loadModel(modelPath, cwd);
  } catch (error) {
    console.error(
      `FAIL model \u2014 ${error.message} (fix: point --model at architecture/sgps-model.json)`,
    );
    return 1;
  }

  const report = verifyModelSourceEvidence(model, cwd);

  for (const result of report.failures) {
    console.error(formatReportLine(result));
  }
  for (const result of report.unverified) {
    console.error(formatReportLine(result));
  }
  for (const result of report.skipped) {
    console.log(formatReportLine(result));
  }

  if (report.failures.length > 0) {
    console.error(
      `Git evidence: FAIL (${report.failures.length} failed, ${report.passed.length} passed, ${report.unverified.length} unverified, ${report.skipped.length} skipped)`,
    );
    return 1;
  }
  // Anything unverified (shallow absence, foreign repository, or an empty
  // model) is never reported as PASS.
  if (
    report.unverified.length > 0 ||
    report.skipped.length > 0 ||
    report.passed.length === 0
  ) {
    console.error(
      `Git evidence: INCOMPLETE (${report.passed.length} passed, ${report.unverified.length} unverified, ${report.skipped.length} skipped)`,
    );
    return 1;
  }
  console.log(`Git evidence: PASS (${report.passed.length} entries)`);
  return 0;
}

const invokedDirectly =
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  process.exit(main());
}
