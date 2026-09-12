/**
 * T8 (remainder) — public assurance language scanner.
 * The state-semantics model bans over-readings in code; this guard bans them in
 * the copy that actually reaches a visitor. Terms come from the model itself
 * (NEVER_IMPLIED_BY_ANY_STATE), so a new banned meaning lands here for free.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { NEVER_IMPLIED_BY_ANY_STATE } from "../../src/lib/public-state-semantics.ts";

/** The model declares the ban vocabulary; the scanner only inspects copy. */
const EXEMPT = new Set([
  "src/lib/public-state-semantics.ts",
  "tests/architecture/public-assurance-language.test.mjs",
]);

const SCAN_ROOTS = ["src/pages", "src/components", "src/data", "src/content"];

/** Prose terms derived from the banned implication keys. */
const TERMS = [
  ...NEVER_IMPLIED_BY_ANY_STATE.filter((key) => key !== "does-not-exist").map(
    (key) => key.replace(/-/g, "[ -]?"),
  ),
  "trust score",
  "risk score",
  "được chứng nhận",
  "được kiểm toán",
  "tuân thủ chuẩn",
];

const PATTERN = new RegExp(`\\b(${TERMS.join("|")})\\b`, "i");

/** Exported for the non-vacuity proof below. */
export function scanAssuranceLanguage(file, source) {
  if (EXEMPT.has(file.replace(/\\/g, "/"))) return [];
  const findings = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const match = line.match(PATTERN);
    if (match) findings.push({ file, line: index + 1, term: match[0] });
  });
  return findings;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(astro|ts|tsx|json|md)$/.test(entry)) out.push(path);
  }
  return out;
}

test("no public copy claims assurance the surfaces cannot support", () => {
  const findings = [];
  for (const root of SCAN_ROOTS) {
    let files = [];
    try {
      files = walk(root);
    } catch {
      continue; // root absent in this checkout
    }
    for (const file of files) {
      findings.push(...scanAssuranceLanguage(file, readFileSync(file, "utf8")));
    }
  }
  assert.deepEqual(
    findings,
    [],
    `assurance over-claim in public copy (fix: state what is verifiable): ${findings
      .map((f) => `${f.file}:${f.line} "${f.term}"`)
      .join("; ")}`,
  );
});

test("the scanner is non-vacuous", () => {
  const injected = scanAssuranceLanguage(
    "src/pages/example.astro",
    "<p>Our audited, certified platform.</p>",
  );
  assert.equal(injected.length, 1, "one finding for one offending line");
  assert.equal(injected[0].line, 1);
  assert.equal(
    scanAssuranceLanguage("src/lib/public-state-semantics.ts", "certified")
      .length,
    0,
    "the ban vocabulary itself is exempt",
  );
  assert.equal(
    scanAssuranceLanguage(
      "src/pages/ok.astro",
      "<p>Source-linked evidence.</p>",
    ).length,
    0,
    "honest copy stays clean",
  );
});
