import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

/**
 * T8 / C3 — canonical public-state semantics.
 *
 * The model must cover every live vocabulary value, must never invent a state,
 * must reject the named over-readings, must fail closed on unknown values, and
 * must not re-declare the unions it maps. Node's type stripping resolves the
 * relative ".ts" import in the module under test.
 */

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const LIB_PATH = "src/lib/public-state-semantics.ts";
const libSource = read(LIB_PATH);

const semantics = await import(
  new URL("../../src/lib/public-state-semantics.ts", import.meta.url).href
);

/* ------------------------------------------------------------------ */
/* Live vocabularies, parsed from their canonical sources.             */
/* ------------------------------------------------------------------ */

const productSchemaSource = read("src/lib/product-schema.ts");
const trustLedgerSource = read("src/data/trust-ledger.ts");
const integritySource = read("src/data/integrity.ts");

function zodEnumValues(name) {
  const block = productSchemaSource.match(
    new RegExp(`const\\s+${name}\\s*=\\s*z\\.enum\\(\\[([\\s\\S]*?)\\]\\)`),
  );
  assert.ok(block, `expected \`${name}\` enum in src/lib/product-schema.ts`);
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function unionValues(typeName, source, file) {
  const union = source.match(
    new RegExp(`export\\s+type\\s+${typeName}\\s*=([\\s\\S]*?);`),
  );
  assert.ok(union, `expected \`${typeName}\` union in ${file}`);
  return [...union[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

const LIVE_VOCABULARIES = {
  "product-lifecycle": zodEnumValues("lifecycle"),
  "product-availability": zodEnumValues("availability"),
  "product-label": zodEnumValues("publicLabel"),
  "trust-ledger": unionValues(
    "TrustState",
    trustLedgerSource,
    "src/data/trust-ledger.ts",
  ),
  integrity: unionValues("TruthState", integritySource, "src/data/integrity.ts"),
};

const ALL_LIVE_STATES = Object.values(LIVE_VOCABULARIES).reduce(
  (total, values) => total + values.length,
  0,
);

/* ------------------------------------------------------------------ */
/* Coverage                                                            */
/* ------------------------------------------------------------------ */

test("live vocabularies parse to the expected shape", () => {
  assert.equal(LIVE_VOCABULARIES["product-lifecycle"].length, 8);
  assert.equal(LIVE_VOCABULARIES["product-availability"].length, 6);
  assert.equal(LIVE_VOCABULARIES["product-label"].length, 6);
  assert.equal(LIVE_VOCABULARIES["trust-ledger"].length, 2);
  assert.equal(LIVE_VOCABULARIES.integrity.length, 5);
  assert.equal(ALL_LIVE_STATES, 27);
});

test("every state in the three live vocabularies is covered — no orphan state", () => {
  for (const [source, values] of Object.entries(LIVE_VOCABULARIES)) {
    for (const value of values) {
      const entry = semantics.getStateSemantics(source, value);
      assert.ok(entry, `unmapped live state: ${source}:${value}`);
      assert.equal(
        typeof entry.meaning,
        "string",
        `${source}:${value} needs a canonical meaning key`,
      );
      assert.ok(
        entry.mayImply.includes(entry.meaning),
        `${source}:${value} mayImply must include its own meaning`,
      );
    }
  }
});

test("the model invents no state and duplicates no pair", () => {
  const seen = new Set();
  for (const { source, value } of semantics.ALL_SURFACE_STATES) {
    assert.ok(
      Object.hasOwn(LIVE_VOCABULARIES, source),
      `unknown source in the model: ${source}`,
    );
    assert.ok(
      LIVE_VOCABULARIES[source].includes(value),
      `state not present in the live vocabulary: ${source}:${value}`,
    );
    const key = `${source}:${value}`;
    assert.ok(!seen.has(key), `duplicate state in the model: ${key}`);
    seen.add(key);
  }
  assert.equal(
    semantics.ALL_SURFACE_STATES.length,
    ALL_LIVE_STATES,
    "exactly one entry per live state",
  );
  assert.equal(
    semantics.PUBLIC_STATE_SEMANTICS.length,
    ALL_LIVE_STATES,
    "the table and the enumeration must agree",
  );
});

test("every entry declares owner, visibility, and a valid truth-state rendering", () => {
  const owners = ["product-registry", "trust-ledger", "integrity-contract"];
  for (const entry of semantics.PUBLIC_STATE_SEMANTICS) {
    assert.ok(
      owners.includes(entry.owner),
      `${entry.source}:${entry.value} has an unknown owner`,
    );
    assert.equal(
      typeof entry.publicFacing,
      "boolean",
      `${entry.source}:${entry.value} must declare visibility`,
    );
    if (entry.mayRenderAsTruthState !== undefined) {
      assert.ok(
        LIVE_VOCABULARIES.integrity.includes(entry.mayRenderAsTruthState),
        `${entry.source}:${entry.value} renders as an unknown truth state`,
      );
    }
  }
});

/* ------------------------------------------------------------------ */
/* Forbidden mappings                                                  */
/* ------------------------------------------------------------------ */

const NAMED_FORBIDDEN = [
  {
    source: "product-availability",
    value: "public",
    implied: "reviewed",
    why: "availability: public must not be read as reviewed",
  },
  {
    source: "trust-ledger",
    value: "available",
    implied: "verified-by-us",
    why: "trust ledger available must not mean an external auditor verified it",
  },
  {
    source: "product-label",
    value: "Available",
    implied: "security-assurance",
    why: "publicLabel Available must not be read as security assurance",
  },
  {
    source: "integrity",
    value: "source-linked",
    implied: "certified",
    why: "source-linked must not be read as certified",
  },
];

test("the named forbidden pairs are rejected with a written reason", () => {
  for (const { source, value, implied, why } of NAMED_FORBIDDEN) {
    assert.equal(
      semantics.isForbiddenMapping(source, value, implied),
      true,
      why,
    );
    const reason = semantics.getForbiddenMappingReason(source, value, implied);
    assert.ok(reason, `${why} — an explicit reason must be recorded`);
    assert.ok(
      reason.trim().length >= 40,
      `${why} — the reason must actually explain the over-reading`,
    );
  }
});

test("assurance and absence readings are forbidden from every public state", () => {
  for (const { source, value } of semantics.ALL_SURFACE_STATES) {
    for (const implied of semantics.NEVER_IMPLIED_BY_ANY_STATE) {
      assert.equal(
        semantics.isForbiddenMapping(source, value, implied),
        true,
        `${source}:${value} must never imply ${implied}`,
      );
    }
  }
});

test("legitimate implications are not flagged as forbidden", () => {
  assert.equal(
    semantics.isForbiddenMapping("integrity", "reviewed", "reviewed"),
    false,
  );
  assert.equal(
    semantics.isForbiddenMapping(
      "trust-ledger",
      "available",
      "trust-surface-exists",
    ),
    false,
  );
  assert.equal(
    semantics.isForbiddenMapping(
      "product-availability",
      "public",
      "product-available-now",
    ),
    false,
  );
});

test("explicit forbidden mappings target live states and land in neverImplies", () => {
  assert.ok(semantics.FORBIDDEN_MAPPINGS.length >= NAMED_FORBIDDEN.length);
  for (const mapping of semantics.FORBIDDEN_MAPPINGS) {
    const entry = semantics.getStateSemantics(mapping.source, mapping.value);
    assert.ok(
      entry,
      `forbidden mapping targets an unmapped state: ${mapping.source}:${mapping.value}`,
    );
    assert.ok(
      entry.neverImplies.includes(mapping.implied),
      `${mapping.source}:${mapping.value} must list ${mapping.implied} in neverImplies`,
    );
    assert.equal(
      semantics.isForbiddenMapping(
        mapping.source,
        mapping.value,
        mapping.implied,
      ),
      true,
    );
    assert.ok(
      typeof mapping.reason === "string" && mapping.reason.trim().length >= 40,
      `${mapping.source}:${mapping.value} -> ${mapping.implied} needs a real reason`,
    );
  }
});

test("mayImply and neverImplies are disjoint and carry the blanket ban", () => {
  for (const entry of semantics.PUBLIC_STATE_SEMANTICS) {
    const forbidden = new Set(entry.neverImplies);
    for (const implied of entry.mayImply) {
      assert.ok(
        !forbidden.has(implied),
        `${entry.source}:${entry.value} both permits and forbids ${implied}`,
      );
    }
    for (const implied of semantics.NEVER_IMPLIED_BY_ANY_STATE) {
      assert.ok(
        forbidden.has(implied),
        `${entry.source}:${entry.value} must forbid ${implied}`,
      );
    }
  }
});

/* ------------------------------------------------------------------ */
/* Fail-closed behaviour                                               */
/* ------------------------------------------------------------------ */

test("unknown values return null — fail closed", () => {
  assert.equal(
    semantics.getStateSemantics("integrity", "definitely-not-a-state"),
    null,
  );
  assert.equal(semantics.getStateSemantics("product-availability", "Public"), null);
  assert.equal(semantics.getStateSemantics("no-such-surface", "available"), null);
  assert.equal(semantics.getStateSemantics("product-label", ""), null);
  assert.equal(semantics.getStateSemantics("trust-ledger", "not published"), null);
});

test("an unmapped state is still bound by the blanket assurance ban", () => {
  assert.equal(
    semantics.isForbiddenMapping("no-such-surface", "whatever", "certified"),
    true,
  );
  assert.equal(
    semantics.isForbiddenMapping("no-such-surface", "whatever", "does-not-exist"),
    true,
  );
  assert.equal(
    semantics.isForbiddenMapping("no-such-surface", "whatever", "reviewed"),
    false,
  );
  assert.equal(
    semantics.getForbiddenMappingReason("no-such-surface", "whatever", "certified"),
    null,
  );
});

/* ------------------------------------------------------------------ */
/* No duplicated vocabulary, no side effects, determinism              */
/* ------------------------------------------------------------------ */

test("the model does not re-declare the live unions", () => {
  assert.doesNotMatch(
    libSource,
    /export\s+type\s+(TruthState|TrustState|Availability|Lifecycle|PublicLabel)\b/,
  );
  assert.doesNotMatch(libSource, /z\.enum\(/);
  assert.doesNotMatch(libSource, /astro\/zod/);
  assert.doesNotMatch(libSource, /\benum\s+[A-Za-z_$][\w$]*\s*\{/);
});

test("the model references the live unions by type instead of copying them", () => {
  assert.match(
    libSource,
    /import type \{ TruthState \} from "\.\.\/data\/integrity\.ts"/,
  );
  assert.match(
    libSource,
    /import type \{ TrustState \} from "\.\.\/data\/trust-ledger\.ts"/,
  );
  assert.match(
    libSource,
    /import type \{[\s\S]*?\bAvailability\b[\s\S]*?\} from "\.\/product-schema\.ts"/,
  );
});

test("no live vocabulary is re-listed as a contiguous declaration", () => {
  const reListings = [
    [/"concept"\s*,\s*"prototype"\s*,\s*"development"/, "lifecycle"],
    [/"private"\s*,\s*"waitlist"\s*,\s*"preview"/, "availability"],
    [/"Preview"\s*,\s*"In development"\s*,\s*"Beta"/, "publicLabel"],
    [/"source-linked"\s*\|\s*"reviewed"/, "TruthState"],
    [/"available"\s*\|\s*"not-published"/, "TrustState"],
  ];
  for (const [pattern, name] of reListings) {
    assert.doesNotMatch(
      libSource,
      pattern,
      `${name} must not be re-declared in the semantics model`,
    );
  }
});

test("the model uses no network, storage, or nondeterministic primitive", () => {
  const banned = [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/,
    /document\.cookie/,
    /\brequire\s*\(/,
    /\bMath\.random\b/,
    /\bDate\.now\b/,
    /\bnew Date\b/,
    /\bprocess\.env\b/,
  ];
  for (const pattern of banned) {
    assert.doesNotMatch(libSource, pattern, `model must not use ${pattern}`);
  }
  assert.doesNotMatch(
    libSource,
    /^\s*import\s+(?!type\b)/m,
    "only type-only imports are allowed in a node-safe model",
  );
});

test("lookups are deterministic and return stable references", () => {
  const first = semantics.getStateSemantics("integrity", "source-linked");
  const second = semantics.getStateSemantics("integrity", "source-linked");
  assert.equal(first, second, "repeat lookup must return the same entry");
  assert.equal(
    JSON.stringify(semantics.ALL_SURFACE_STATES),
    JSON.stringify(semantics.ALL_SURFACE_STATES),
  );
  const sources = [
    ...new Set(semantics.PUBLIC_STATE_SEMANTICS.map((entry) => entry.source)),
  ].sort();
  assert.deepEqual(sources, [
    "integrity",
    "product-availability",
    "product-label",
    "product-lifecycle",
    "trust-ledger",
  ]);
});
