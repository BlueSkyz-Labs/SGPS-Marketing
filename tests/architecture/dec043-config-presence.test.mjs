// SGPS-DEC-2026-043 point 6 (config presence), project-local guard.
// Derives every PUBLIC_* build-time key the source reads, requires each one to
// be classified, and requires the "declared" ones to exist in the repository
// production config (.env.production). Mapping: docs/sgps/2026-10-24-dec-043-staging-parity-mapping.md
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const PRODUCTION_CONFIG = ".env.production";

// Non-secret keys production depends on that MUST be declared in the repo.
const REQUIRED_DECLARED = ["PUBLIC_CONTACT_EMAIL", "PUBLIC_SUPPORT_EMAIL"];

// Keys production's `validate:public-truth` gate requires but the repo does
// not yet declare. They are dashboard-only today: NOT VERIFIED, an Owner gap
// (mapping doc, P3). Moving one into .env.production is an Owner-gated
// production config change; when done, move it to REQUIRED_DECLARED.
const DASHBOARD_ONLY_GAP = ["PUBLIC_SITE_URL", "PUBLIC_SECURITY_EMAIL"];

// Intentionally optional: the source reads them, and an absent value yields
// null (publicMailboxForRole), which soft-lands instead of failing the build.
const OPTIONAL = ["PUBLIC_PRIVACY_EMAIL", "PUBLIC_FOUNDER_EMAIL"];

function keysIn(text) {
  return new Set(
    [
      ...text.matchAll(
        /(?:import\.meta\.env\??|process\.env)\??\.(PUBLIC_[A-Z0-9_]+)/g,
      ),
    ].map((m) => m[1]),
  );
}

function declaredKeys() {
  return new Set(
    readFileSync(PRODUCTION_CONFIG, "utf8")
      .split("\n")
      .map((l) => /^\s*(PUBLIC_[A-Z0-9_]+)\s*=/.exec(l)?.[1])
      .filter(Boolean),
  );
}

test("every PUBLIC_* key the source reads is classified for DEC-043", () => {
  const read = new Set([
    ...keysIn(readFileSync("src/data/site.ts", "utf8")),
    ...keysIn(readFileSync("src/lib/truth.ts", "utf8")),
    ...keysIn(readFileSync("astro.config.mjs", "utf8")),
    ...keysIn(readFileSync("scripts/validate-public-truth.mjs", "utf8")),
  ]);
  const classified = new Set([
    ...REQUIRED_DECLARED,
    ...DASHBOARD_ONLY_GAP,
    ...OPTIONAL,
  ]);
  assert.ok(read.size >= 6, "key discovery found too few keys");
  for (const key of read) {
    assert.ok(
      classified.has(key),
      `${key} is read by the source but unclassified; declare it in ${PRODUCTION_CONFIG} or classify it here`,
    );
  }
});

test("required non-secret production keys are declared in the repo production config", () => {
  const declared = declaredKeys();
  for (const key of REQUIRED_DECLARED) {
    assert.ok(
      declared.has(key),
      `${key} must be declared in ${PRODUCTION_CONFIG} (DEC-043 P3)`,
    );
  }
});

test("production config declares no secret-shaped keys", () => {
  for (const key of declaredKeys()) {
    assert.doesNotMatch(key, /SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY/);
  }
});
