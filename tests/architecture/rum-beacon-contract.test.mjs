/**
 * ADR 0015 / SGPS-DEC-2026-039 Part C: the one permitted client beacon
 * (Cloudflare Web Analytics) stays aggregate-only and narrowly scoped.
 *
 * - script-src admits exactly one third-party source, the beacon's full path;
 * - connect-src stays 'self' (the proxied zone posts to /cdn-cgi/rum);
 * - Trusted Types enforcement stays on;
 * - the declared beacon fields carry no identifier (negative proof below);
 * - the privacy notice names the processor in every locale before the
 *   beacon can be switched on.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { PRIVACY_COPY } from "../../src/data/trust-copy.ts";

// Trailing slash = CSP prefix match on this path only. The injected tag is
// /beacon.min.js/<version>, which a slash-less source (exact match) blocks.
const BEACON = "https://static.cloudflareinsights.com/beacon.min.js/";
const LANGS = ["en", "vi", "zh", "zh-hant"];

const cspLine = readFileSync("public/_headers", "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line.startsWith("Content-Security-Policy:"));

function directive(csp, name) {
  return (
    csp
      .replace(/^Content-Security-Policy:\s*/, "")
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name} `)) ?? ""
  );
}

/** Every non-keyword source in a directive (hosts, schemes, URLs). */
function externalSources(value) {
  return value
    .split(/\s+/)
    .slice(1)
    .filter((source) => !source.startsWith("'"));
}

export function scriptSrcProblems(csp) {
  const problems = [];
  const sources = externalSources(directive(csp, "script-src"));
  if (sources.length !== 1 || sources[0] !== BEACON) {
    problems.push(`script-src must admit only ${BEACON}: ${sources}`);
  }
  if (externalSources(directive(csp, "connect-src")).length > 0) {
    problems.push("connect-src must stay 'self'");
  }
  if (!/require-trusted-types-for 'script'/.test(csp)) {
    problems.push("Trusted Types enforcement is off");
  }
  return problems;
}

const IDENTIFIER =
  /(^|[-_])(id|uid|uuid|session|visitor|user|client|cookie|ip|fingerprint|email|phone|device-id)([-_]|$)/i;

export function fieldProblems(fields) {
  // camelCase and snake_case both normalise to kebab tokens before matching.
  const kebab = (name) =>
    name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-");
  return fields
    .filter((field) => IDENTIFIER.test(kebab(field.name)))
    .map((field) => `identifier-like beacon field: ${field.name}`);
}

test("script-src admits exactly the beacon path; connect-src and Trusted Types stay strict", () => {
  assert.ok(cspLine, "CSP line present");
  assert.deepEqual(scriptSrcProblems(cspLine), []);
});

test("negative proof: a host-wide, wildcard or extra script source is rejected", () => {
  for (const broken of [
    cspLine.replace(BEACON, "https://static.cloudflareinsights.com"),
    cspLine.replace(BEACON, "https://*.cloudflareinsights.com/beacon.min.js/"),
    cspLine.replace(BEACON, "https://static.cloudflareinsights.com/other.js/"),
    cspLine.replace(
      BEACON,
      "https://static.cloudflareinsights.com/beacon.min.js",
    ),
    cspLine.replace(BEACON, "https://static.cloudflareinsights.com/"),
    cspLine.replace(BEACON, `${BEACON} https://cdn.example.com/x.js`),
    cspLine.replace(
      "connect-src 'self'",
      "connect-src 'self' https://cloudflareinsights.com",
    ),
    cspLine.replace(/;\s*require-trusted-types-for 'script'/, ""),
  ]) {
    assert.ok(scriptSrcProblems(broken).length > 0, broken);
  }
});

test("declared beacon fields carry no identifier", () => {
  const contract = JSON.parse(
    readFileSync("docs/sgps/adoption/rum-beacon-fields.json", "utf8"),
  );
  assert.equal(`${contract.scriptUrl}/`, BEACON);
  assert.equal(contract.endpoint, "/cdn-cgi/rum");
  assert.ok(contract.declaredFields.length > 0);
  for (const field of contract.declaredFields) {
    assert.match(field.source, /^https:\/\/developers\.cloudflare\.com\//);
  }
  assert.deepEqual(fieldProblems(contract.declaredFields), []);
  assert.match(contract.killSwitch, /Cloudflare dashboard/);
});

test("negative proof: a payload carrying an identifier fails review", () => {
  for (const name of [
    "visitorId",
    "session_id",
    "client-ip",
    "user",
    "cookie",
    "fingerprint",
  ]) {
    assert.equal(fieldProblems([{ name }]).length, 1, name);
  }
});

test("the privacy notice names the processor in every locale", () => {
  for (const lang of LANGS) {
    assert.match(
      PRIVACY_COPY[lang].collectedBody,
      /Cloudflare Web Analytics/,
      lang,
    );
    assert.match(PRIVACY_COPY[lang].collectedBody, /7/, `${lang} retention`);
  }
});
