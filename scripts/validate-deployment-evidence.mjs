#!/usr/bin/env node
/**
 * Deployment / runtime read-back evidence validator - offline, read-only.
 *
 * A post-merge ledger may only certify the exact revision that was deployed
 * and read back: stale runtime evidence must never silently certify a newer
 * source revision.
 *
 * Two modes are intentionally separate:
 *
 *   BASELINE (default)
 *     Validates that the newest historical post-merge ledger is structurally
 *     credible. It NEVER emits "Deployment evidence: PASS" and does not claim
 *     that the current source candidate is deployed.
 *
 *   EXACT CERTIFICATION (--expected-sha <40-hex>)
 *     Requires the ledger to record the same full 40-character Git revision.
 *     Only this mode may emit "Deployment evidence: PASS (<sha>)".
 *
 * Required in the ledger:
 *   1. a Git revision (7-40 hex) declared as the deployed head/source SHA.
 *      Baseline mode accepts historical abbreviated SHAs; exact certification
 *      requires the ledger itself to carry the full 40-character revision.
 *   2. a production smoke result line whose verdict is PASS.
 *   3. a read-back section that mentions the production host.
 *
 * Provider identifiers stay internal evidence metadata; they are never
 * treated as customer-facing proof. Nothing is inferred from timestamps.
 *
 * Usage:
 *   node scripts/validate-deployment-evidence.mjs [ledger-path]
 *   node scripts/validate-deployment-evidence.mjs [ledger-path] \
 *     --expected-sha <40-hex>
 *
 * Default ledger: newest docs/evidence/*post-merge*.md by name.
 * Exit: 1 on any violation, otherwise 0.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Canonical production host, mirrored from scripts/smoke-production.mjs. */
export const CANONICAL_HOST = "blueskyzlabs.com";

export const EVIDENCE_DIR = "docs/evidence";

const LEDGER_PATTERN = /post-merge/i;
const SHA_PATTERN = /\b[0-9a-f]{7,40}\b/;
const FULL_SHA_PATTERN = /\b[0-9a-f]{40}\b/;
const EXACT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const DECLARATION_PATTERN =
  /deploy(?:ed|ment)?\s*(?:head|sha|revision|commit)|\bsource\s*sha\b/i;
const VERDICT_PATTERN = /\b(PASS|FAIL|NOT_RUN)\b/i;
const SMOKE_PATTERN = /smoke/i;
const SMOKE_REFERENCE =
  /smoke[\s-]*(?:command|result|checks?|gate)|smoke-production/i;
const READ_BACK_HEADING = /^#{1,6}\s+.*read[\s-]?back/i;
const HEADING = /^#{1,6}\s+/;
const SMOKE_WINDOW = 3;

/**
 * Extracts the declared deployed revision. The declaration line wins; when
 * no declaration exists the first revision-shaped token is used, and a
 * missing revision returns null instead of guessing from timestamps.
 */
export function parseDeployedSha(text) {
  const lines = text.split(/\r?\n/);
  const declared = lines.find((line) => DECLARATION_PATTERN.test(line));
  const searchLines = declared ? [declared, ...lines] : lines;

  for (const line of searchLines) {
    const match = line.match(FULL_SHA_PATTERN) ?? line.match(SHA_PATTERN);
    if (match) return match[0].toLowerCase();
  }
  return null;
}

/**
 * Finds the production smoke verdict. Smoke command/result lines are ranked
 * ahead of incidental prose that merely mentions smoke, and a verdict may
 * sit on the smoke line or on one of the two lines that follow it.
 */
export function findSmokeResult(text) {
  const lines = text.split(/\r?\n/);
  const entries = lines
    .map((line, index) => ({ line, index }))
    .filter((entry) => SMOKE_PATTERN.test(entry.line));
  const ranked = [
    ...entries.filter((entry) => SMOKE_REFERENCE.test(entry.line)),
    ...entries.filter((entry) => !SMOKE_REFERENCE.test(entry.line)),
  ];

  for (const { line, index } of ranked) {
    const window = lines.slice(index, index + SMOKE_WINDOW).join(" ");
    const verdict = window.match(VERDICT_PATTERN);
    if (verdict) {
      return { line: line.trim(), verdict: verdict[1].toUpperCase() };
    }
  }
  return null;
}

/**
 * Text of every read-back section (a heading whose body ends at the next
 * heading). Falls back to the whole ledger when it has no such heading.
 */
export function findReadBackSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!READ_BACK_HEADING.test(lines[index])) continue;
    const rest = lines.slice(index + 1);
    const offset = rest.findIndex((line) => HEADING.test(line));
    const end = offset === -1 ? lines.length : index + 1 + offset;
    sections.push(lines.slice(index, end).join("\n"));
  }

  return sections.length > 0 ? sections : [text];
}

function violation(subject, detail, fix) {
  return { subject, detail, fix };
}

/**
 * Validate one ledger.
 *
 * When expectedSha is supplied, the evidence is being used to certify an
 * exact deployed revision. The expected SHA and ledger SHA must both be full
 * 40-character revisions and must match exactly.
 */
export function validateLedger(
  text,
  { host = CANONICAL_HOST, expectedSha = null } = {},
) {
  const violations = [];

  const sha = parseDeployedSha(text);
  if (sha === null) {
    violations.push(
      violation(
        "deployed-sha",
        "no Git revision (7-40 hex) is recorded for the deployed head",
        "record the provider's deployed head, e.g. `Deployed head: <sha>`",
      ),
    );
  }

  if (expectedSha !== null) {
    const normalizedExpected = String(expectedSha).toLowerCase();
    if (!EXACT_SHA_PATTERN.test(normalizedExpected)) {
      violations.push(
        violation(
          "expected-sha",
          "exact certification requires a full 40-character expected SHA",
          "pass --expected-sha with the exact served Git revision",
        ),
      );
    } else if (sha !== null && !EXACT_SHA_PATTERN.test(sha)) {
      violations.push(
        violation(
          "deployed-sha-binding",
          `ledger revision ${sha} is abbreviated and cannot certify exact revision ${normalizedExpected}`,
          "record the full 40-character deployed Git revision in the ledger",
        ),
      );
    } else if (sha !== null && sha !== normalizedExpected) {
      violations.push(
        violation(
          "deployed-sha-binding",
          `ledger revision ${sha} does not match expected revision ${normalizedExpected}`,
          "read back the actual served revision and record evidence for that exact SHA",
        ),
      );
    }
  }

  const smoke = findSmokeResult(text);
  if (smoke === null) {
    violations.push(
      violation(
        "smoke-result",
        "no production smoke result line was found",
        "record the smoke command and its verdict",
      ),
    );
  } else if (smoke.verdict !== "PASS") {
    violations.push(
      violation(
        "smoke-result",
        `smoke verdict is ${smoke.verdict}, not PASS`,
        "re-run node scripts/smoke-production.mjs and record the PASS verdict",
      ),
    );
  }

  const readBack = findReadBackSections(text);
  const mentionsHost = readBack.some((section) =>
    section.toLowerCase().includes(host.toLowerCase()),
  );
  if (!mentionsHost) {
    violations.push(
      violation(
        "read-back-host",
        `read-back does not mention the production host ${host}`,
        `record the live read-back against https://${host}`,
      ),
    );
  }

  return { sha, smoke, violations };
}

export function formatViolation(item) {
  return `FAIL ${item.subject} — ${item.detail} (fix: ${item.fix})`;
}

/** Newest date-prefixed post-merge ledger; null when none exists. */
export function resolveDefaultLedger(root = process.cwd()) {
  const dir = join(root, EVIDENCE_DIR);
  if (!existsSync(dir)) return null;

  const candidates = readdirSync(dir)
    .filter((name) => name.endsWith(".md") && LEDGER_PATTERN.test(name))
    .sort();
  if (candidates.length === 0) return null;

  return join(dir, candidates[candidates.length - 1]);
}

function parseArguments(argv, root) {
  let ledgerPath = null;
  let expectedSha = null;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--expected-sha") {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error("--expected-sha requires a full 40-character SHA");
      }
      expectedSha = next.toLowerCase();
      index += 1;
      continue;
    }
    if (value.startsWith("--")) {
      throw new Error(`unknown option ${value}`);
    }
    if (ledgerPath !== null) {
      throw new Error("only one ledger path may be supplied");
    }
    ledgerPath = value;
  }

  if (expectedSha !== null && !EXACT_SHA_PATTERN.test(expectedSha)) {
    throw new Error("--expected-sha must be a full 40-character lowercase hex SHA");
  }

  return {
    ledger: ledgerPath ? resolve(root, ledgerPath) : resolveDefaultLedger(root),
    expectedSha,
  };
}

export function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArguments(argv, process.cwd());
  } catch (error) {
    console.log(
      `FAIL arguments — ${error.message} (fix: use [ledger-path] --expected-sha <40-hex>)`,
    );
    process.exitCode = 1;
    return 1;
  }

  const { ledger, expectedSha } = args;

  if (ledger === null || !existsSync(ledger)) {
    console.log(
      `FAIL ledger — no post-merge evidence ledger found (fix: pass a path ` +
        `or add docs/evidence/*post-merge*.md)`,
    );
    process.exitCode = 1;
    return 1;
  }

  const { sha, violations } = validateLedger(readFileSync(ledger, "utf8"), {
    expectedSha,
  });

  console.log(`Ledger: ${ledger}`);
  for (const item of violations) {
    console.log(formatViolation(item));
  }

  if (violations.length > 0) {
    console.log(`${violations.length} deployment evidence violation(s)`);
    process.exitCode = 1;
    return 1;
  }

  if (expectedSha !== null) {
    console.log(`Deployment evidence: PASS (${sha})`);
  } else {
    console.log(
      `Deployment evidence baseline: VALID (${sha}) — historical ledger only; current revision NOT_VERIFIED`,
    );
  }
  process.exitCode = 0;
  return 0;
}

function isDirectInvocation() {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return resolve(entry) === fileURLToPath(import.meta.url);
}

if (isDirectInvocation()) {
  main();
}
