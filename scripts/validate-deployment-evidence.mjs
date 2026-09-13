#!/usr/bin/env node
/**
 * Deployment / runtime read-back evidence validator - offline, read-only.
 *
 * A post-merge ledger may only certify the exact revision that was deployed
 * and read back (plan Task 7): stale runtime evidence must never silently
 * certify a newer source revision.
 *
 * Required in the ledger:
 *   1. a Git revision (7-40 hex) declared as the deployed head/source SHA.
 *      A full 40-hex revision is used verbatim when the ledger records one;
 *      abbreviated revisions are accepted but never expanded or guessed.
 *   2. a production smoke result line whose verdict is PASS.
 *   3. a read-back section that mentions the production host.
 *
 * Provider identifiers stay internal evidence metadata; they are never
 * treated as customer-facing proof. Nothing is inferred from timestamps.
 *
 * Usage: node scripts/validate-deployment-evidence.mjs [ledger-path]
 *        (default: newest docs/evidence/*post-merge*.md by name)
 * Exit:  1 on any violation, 0 with `Deployment evidence: PASS (<sha>)`.
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

export function validateLedger(text, { host = CANONICAL_HOST } = {}) {
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

function parseLedgerPath(argv, root) {
  const candidate = argv.find((value) => !value.startsWith("--"));
  return candidate ? resolve(candidate) : resolveDefaultLedger(root);
}

export function main(argv = process.argv.slice(2)) {
  const ledger = parseLedgerPath(argv, process.cwd());

  if (ledger === null || !existsSync(ledger)) {
    console.log(
      `FAIL ledger — no post-merge evidence ledger found (fix: pass a path ` +
        `or add docs/evidence/*post-merge*.md)`,
    );
    process.exitCode = 1;
    return 1;
  }

  const { sha, violations } = validateLedger(readFileSync(ledger, "utf8"));

  console.log(`Ledger: ${ledger}`);
  for (const item of violations) {
    console.log(formatViolation(item));
  }

  if (violations.length > 0) {
    console.log(`${violations.length} deployment evidence violation(s)`);
    process.exitCode = 1;
    return 1;
  }

  console.log(`Deployment evidence: PASS (${sha})`);
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
