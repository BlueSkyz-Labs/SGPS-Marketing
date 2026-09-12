import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ledger = readFileSync("src/data/trust-ledger.ts", "utf8");
const ledgerComponent = readFileSync(
  "src/components/experience/TrustLedger.astro",
  "utf8",
);
const trustSection = readFileSync(
  "src/components/sections/Trust.astro",
  "utf8",
);
const atlasSource = readFileSync("src/lib/atlas.ts", "utf8");
const atlasComponent = readFileSync(
  "src/components/experience/Atlas.astro",
  "utf8",
);

test("trust ledger uses only truthful states and evidence kinds", () => {
  // Lock the declared type unions themselves.
  assert.match(
    ledger,
    /export type TrustState = "available" \| "not-published";/,
  );
  assert.match(ledger, /evidenceKind: "route" \| "private-reporting";/);

  const states = [...ledger.matchAll(/state:\s*"([^"]+)",/g)].map((m) => m[1]);
  assert.equal(states.length, 3, "expected exactly three ledger states");
  for (const state of states) {
    assert.ok(
      ["available", "not-published"].includes(state),
      `invalid trust state: ${state}`,
    );
  }

  const kinds = [...ledger.matchAll(/evidenceKind:\s*"([^"]+)",/g)].map(
    (m) => m[1],
  );
  assert.equal(kinds.length, 3, "expected exactly three evidence kinds");
  for (const kind of kinds) {
    assert.ok(
      ["route", "private-reporting"].includes(kind),
      `invalid evidence kind: ${kind}`,
    );
  }
});

test("trust ledger covers exactly privacy, security, and support lanes", () => {
  const ids = [...ledger.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    [...new Set(ids)].sort(),
    ["privacy", "security", "support"],
    "ledger lanes must stay bounded to the three verified surfaces",
  );
});

test("trust ledger contains no fabricated assurance fields or badge claims", () => {
  for (const forbidden of [
    "verified",
    "certified",
    "trustScore",
    "maturityScore",
  ]) {
    assert.doesNotMatch(
      ledger,
      new RegExp(`\\b${forbidden}\\s*:`),
      `${forbidden} must never be a ledger field`,
    );
  }
  for (const claim of [
    /certifi/i,
    /\bISO\b/,
    /\bSOC\b/,
    /bank-grade/i,
    /military-grade/i,
    /trust score/i,
    /maturity score/i,
  ]) {
    assert.doesNotMatch(ledger, claim, `ledger data must not match ${claim}`);
    assert.doesNotMatch(
      ledgerComponent,
      claim,
      `ledger component must not match ${claim}`,
    );
  }
});

test("every ledger entry is localized in both languages", () => {
  const en = [...ledger.matchAll(/\ben:\s*"/g)].length;
  const vi = [...ledger.matchAll(/\bvi:\s*"/g)].length;
  assert.ok(en >= 9, `expected at least 9 EN strings, found ${en}`);
  assert.equal(en, vi, "EN and VI string counts must match");
});

test("the trust section renders through the ledger model", () => {
  assert.match(
    trustSection,
    /TrustLedger/,
    "Trust section must render the ledger component",
  );
  assert.match(
    ledgerComponent,
    /@\/data\/trust-ledger/,
    "ledger component must consume the shared ledger data",
  );
  assert.match(ledgerComponent, /TRUST_LEDGER/);
});

test("atlas derives nodes only from truth sources", () => {
  assert.match(
    atlasSource,
    /export type AtlasNodeKind/,
    "atlas must declare its node kind union",
  );
  // v3 G6: claim/evidence kinds join the constellation; the original four
  // semantics must remain intact.
  for (const kind of ["brand", "principle", "trust", "product"]) {
    assert.ok(
      atlasSource.includes(`| "${kind}"`) ||
        atlasSource.includes(`"${kind}" |`),
      `atlas must keep the ${kind} node kind`,
    );
  }
  assert.match(
    atlasSource,
    /PRINCIPLE_MATRIX/,
    "principle nodes must come from the shared experience model",
  );
  assert.match(
    atlasSource,
    /TRUST_LEDGER/,
    "trust nodes must come from the verifiable trust ledger",
  );
  assert.match(
    atlasSource,
    /ProductEntry/,
    "product nodes must come from the public product registry type",
  );
  assert.match(
    atlasComponent,
    /aria-hidden="true"/,
    "decorative SVG must be hidden from assistive technology",
  );
  assert.match(
    atlasComponent,
    /data-atlas-node/,
    "semantic representation must expose meaningful nodes",
  );
});
