/**
 * H4 — security surface contract.
 * The machine-readable security policy must exist, point at the same advisory
 * channel the site already declares, and never silently expire. The edge
 * headers that protect every route are asserted from source and from the built
 * output, so a header cannot disappear without a failing gate.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { INTEGRITY_ENTRIES } from "../../src/data/integrity.ts";

const SECURITY_TXT = "public/.well-known/security.txt";
const HEADERS = "public/_headers";

function fields(source) {
  const map = new Map();
  for (const line of source.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const match = /^([A-Za-z-]+):\s*(.+)$/.exec(line);
    if (match) map.set(match[1].toLowerCase(), match[2].trim());
  }
  return map;
}

test("security.txt declares the required RFC 9116 fields", () => {
  assert.ok(existsSync(SECURITY_TXT), "security.txt must exist");
  const declared = fields(readFileSync(SECURITY_TXT, "utf8"));
  assert.ok(declared.get("contact"), "Contact is required");
  assert.match(declared.get("contact"), /^https:\/\//, "Contact must be https");
  assert.ok(declared.get("expires"), "Expires is required");
  assert.ok(
    declared.get("preferred-languages")?.includes("en") &&
      declared.get("preferred-languages")?.includes("vi"),
    "both public languages must be offered",
  );
  assert.equal(
    declared.get("canonical"),
    "https://blueskyzlabs.com/.well-known/security.txt",
  );
});

test("the advisory channel is the one the site already publishes", () => {
  const declared = fields(readFileSync(SECURITY_TXT, "utf8"));
  const contact = declared.get("contact");
  const known = INTEGRITY_ENTRIES.flatMap((entry) =>
    entry.evidence.map((ref) => ref.href.en),
  );
  assert.ok(
    known.includes(contact),
    `security.txt Contact (${contact}) must be the declared public advisory channel`,
  );
});

test("security.txt does not expire unnoticed", () => {
  const declared = fields(readFileSync(SECURITY_TXT, "utf8"));
  const expires = Date.parse(declared.get("expires"));
  assert.ok(Number.isFinite(expires), "Expires must parse as a date");
  const now = Date.now();
  const days = (expires - now) / 86_400_000;
  assert.ok(
    days > 90,
    `renew soon: Expires is only ${Math.round(days)} days away`,
  );
  assert.ok(days < 550, "Expires should be renewed roughly annually");
});

test("the edge headers keep their protective set", () => {
  const source = readFileSync(HEADERS, "utf8");
  for (const header of [
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Strict-Transport-Security:",
    "Content-Security-Policy:",
    "Permissions-Policy:",
  ]) {
    assert.ok(source.includes(header), `missing header: ${header}`);
  }
  const csp = /Content-Security-Policy:\s*(.+)/.exec(source)?.[1] ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /script-src 'self'/);
  assert.doesNotMatch(
    csp,
    /script-src[^;]*'unsafe-(inline|eval)'/,
    "scripts must stay external and un-eval'd",
  );
  assert.match(csp, /base-uri 'self'/);
});

test("preview hosts stay out of the index", () => {
  const source = readFileSync(HEADERS, "utf8");
  assert.match(source, /workers\.dev\/\*\n\s+X-Robots-Tag: noindex/);
});

test("the built output ships both files", () => {
  if (!existsSync("dist")) return; // architecture tests may run before build
  assert.ok(
    existsSync("dist/.well-known/security.txt"),
    "the build must publish security.txt",
  );
  assert.ok(existsSync("dist/_headers"), "the build must publish _headers");
  const built = readFileSync("dist/_headers", "utf8");
  assert.match(built, /Content-Security-Policy:/);
});
