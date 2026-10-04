/**
 * v10 E4 (M02) — navigation prefetch contract.
 *
 * Guard intent: the opt-in navigation prefetch must stay exactly what the M02
 * experiment sanctions — prefetch only (never prerender), a tiny allowlist
 * derived from the single nav source (`getNav`), moderate eagerness, and a CSP
 * that admits the inline rule set through the dedicated
 * `'inline-speculation-rules'` keyword rather than `'unsafe-inline'`.
 *
 * Repo conventions: node:test + node:assert/strict, ESM only, paths are
 * relative to the repository root. Every detector is exported so the
 * non-vacuity tests below can feed it a synthetic offending input and prove it
 * actually fires.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const LAYOUT = "src/layouts/BaseLayout.astro";
const HEADERS = "public/_headers";

// ---------------------------------------------------------------------------
// Detectors (exported: the non-vacuity tests call them directly).
// ---------------------------------------------------------------------------

/** A `prerender:` rules key is banned — M02 allows prefetch only. */
export function findPrerenderKey(source) {
  return /prerender["']?\s*:/.test(source);
}

/** The rules must be emitted from the nav source, not a hardcoded list. */
export function allowlistComesFromNav(source) {
  return /urls:\s*getNav\(/.test(source);
}

/**
 * Extract one CSP directive (e.g. `script-src`) from a policy string so the
 * assertion can never be satisfied by a keyword living in a sibling directive
 * (the style-src 'unsafe-inline' is legitimate and must not mask a script-src
 * violation).
 */
export function extractDirective(policy, name) {
  const match = policy.match(new RegExp(`(?:^|;)\\s*${name}\\s+([^;]*)`));
  return match ? match[1] : null;
}

/** script-src may admit the inline rule set only via the dedicated keyword. */
export function scriptSrcViolations(policy) {
  const directive = extractDirective(policy, "script-src");
  const problems = [];
  if (directive === null) {
    problems.push("no script-src directive found");
    return problems;
  }
  if (!directive.includes("'inline-speculation-rules'")) {
    problems.push("script-src lacks 'inline-speculation-rules'");
  }
  if (directive.includes("'unsafe-inline'")) {
    problems.push("script-src must never carry 'unsafe-inline'");
  }
  return problems;
}

// ---------------------------------------------------------------------------
// The contract, measured on the real files.
// ---------------------------------------------------------------------------

test("the layout emits a speculationrules script", () => {
  const source = readFileSync(LAYOUT, "utf8");
  assert.ok(
    source.includes('type="speculationrules"'),
    "BaseLayout must emit a script[type=speculationrules]",
  );
  assert.ok(
    source.includes("prefetch:"),
    "the rule set must contain a prefetch list",
  );
});

test("prefetch only — no prerender key anywhere in the rule set", () => {
  const source = readFileSync(LAYOUT, "utf8");
  assert.ok(
    !findPrerenderKey(source),
    "M02 forbids speculative prerender; a `prerender:` key appeared",
  );
});

test("the allowlist is derived from the shared nav source", () => {
  const source = readFileSync(LAYOUT, "utf8");
  assert.ok(
    allowlistComesFromNav(source),
    "the prefetch urls must be derived from getNav(currentLang), not hardcoded",
  );
});

test("eagerness stays moderate (hover-triggered, not eager)", () => {
  const source = readFileSync(LAYOUT, "utf8");
  assert.ok(
    /eagerness:\s*"moderate"/.test(source),
    'the M02 experiment runs at "moderate" eagerness',
  );
  assert.ok(
    !/eagerness:\s*"eager"/.test(source),
    '"eager" would prefetch on every page view and is out of scope',
  );
});

test("CSP admits the inline rule set only via the dedicated keyword", () => {
  const headers = readFileSync(HEADERS, "utf8");
  const cspLine = headers
    .split("\n")
    .find((line) => line.trim().startsWith("Content-Security-Policy:"));
  assert.ok(cspLine, "public/_headers must declare a Content-Security-Policy");
  const policy = cspLine.slice(cspLine.indexOf(":") + 1).trim();
  assert.deepEqual(scriptSrcViolations(policy), []);
});

// ---------------------------------------------------------------------------
// Non-vacuity: every detector must fire on a synthetic offender.
// ---------------------------------------------------------------------------

test("non-vacuity: the prerender detector fires", () => {
  assert.equal(findPrerenderKey('{"prerender":[{"urls":["/x/"]}]}'), true);
  assert.equal(findPrerenderKey('{"prefetch":[{"urls":["/x/"]}]}'), false);
});

test("non-vacuity: the nav-derivation detector fires", () => {
  assert.equal(
    allowlistComesFromNav("urls: getNav(currentLang).map((i) => i.href)"),
    true,
  );
  assert.equal(allowlistComesFromNav('urls: ["/en/products/"]'), false);
});

test("non-vacuity: the CSP detector fires on both violations", () => {
  assert.deepEqual(
    scriptSrcViolations(
      "default-src 'self'; script-src 'self' 'inline-speculation-rules'; style-src 'unsafe-inline'",
    ),
    [],
  );
  assert.ok(
    scriptSrcViolations("default-src 'self'; script-src 'self'").length > 0,
    "a missing keyword must fail",
  );
  assert.ok(
    scriptSrcViolations("default-src 'self'; script-src 'self' 'unsafe-inline'")
      .length > 0,
    "'unsafe-inline' in script-src must fail even when the keyword is present",
  );
  // The sibling directive must not mask the check.
  assert.ok(
    scriptSrcViolations(
      "script-src 'self' 'inline-speculation-rules'; style-src 'self' 'unsafe-inline'",
    ).length === 0,
    "style-src 'unsafe-inline' is legitimate and must not trip the script-src check",
  );
});
