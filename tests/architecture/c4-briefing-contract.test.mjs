import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  BRIEFING_PURPOSES,
  compilePublicBriefing,
} from "../../src/lib/briefing.ts";
import { CLAIMS } from "../../src/data/claims.ts";
import { compilePublicDossier } from "../../src/lib/dossier.ts";
import { getPublicProvenance } from "../../src/lib/provenance-lens.ts";

const SOURCE = readFileSync(
  path.join(import.meta.dirname, "../../src/lib/briefing.ts"),
  "utf8",
);

/** A claim the product really publishes, proven composable before it is used. */
function publishedClaimIds(limit = 3) {
  // Claims whose provenance the lens refuses (self-only chains) are not
  // published claims, so they are not eligible fixtures here; the refusal
  // itself is asserted separately below.
  const ids = CLAIMS.map((claim) => claim.id).filter((id) => {
    const provenance = getPublicProvenance(id, "en");
    return provenance !== null && provenance.unknown === false;
  });
  // A floor, not a quota: the site must always have at least two published
  // claims worth composing, while how many the fabric currently declares is a
  // published-claims fact this helper reports rather than invents.
  assert.ok(
    ids.length >= 2,
    `expected at least two published claims, found ${ids.length}`,
  );
  return ids.slice(0, Math.min(limit, ids.length));
}

test("an empty selection produces no sections and invents nothing", () => {
  const briefing = compilePublicBriefing({ purpose: "executive" }, "en");
  assert.deepEqual(briefing.sections, []);
  assert.deepEqual(briefing.missing, []);
  assert.equal(briefing.complete, true);
});

test("the declared purposes are the only ones accepted", () => {
  assert.deepEqual(
    [...BRIEFING_PURPOSES],
    ["executive", "technical", "trust", "release"],
  );
  for (const purpose of BRIEFING_PURPOSES) {
    const briefing = compilePublicBriefing({ purpose }, "en");
    assert.equal(briefing.purpose, purpose);
  }
  const rejected = compilePublicBriefing({ purpose: "promotional" }, "en");
  assert.equal(rejected.purpose, null, "an unknown purpose fails closed");
  assert.deepEqual(rejected.sections, []);
});

test("every factual section carries the canonical source identities", () => {
  const ids = publishedClaimIds(2);
  const briefing = compilePublicBriefing(
    { purpose: "trust", claimIds: ids },
    "en",
  );
  assert.ok(briefing.sections.length > 0);
  for (const section of briefing.sections) {
    const provenance = getPublicProvenance(section.subject, "en");
    assert.ok(
      provenance !== null,
      `${section.subject} must resolve canonically`,
    );
    assert.equal(section.statement, provenance.statement);
    assert.deepEqual(
      section.sourceRefs.map((ref) => ref.id),
      provenance.sourceRefs.map((ref) => ref.id),
      "source refs must be the adapter's own identities, in its order",
    );
    assert.deepEqual(
      section.sourceRefs.map((ref) => ref.href),
      provenance.sourceRefs.map((r) => r.href),
    );
  }
});

test("an unpublished or private id is reported, never rendered", () => {
  const briefing = compilePublicBriefing(
    {
      purpose: "executive",
      claimIds: ["not-a-published-claim", "also-missing"],
    },
    "en",
  );
  assert.deepEqual(briefing.sections, []);
  assert.deepEqual(
    briefing.missing.map((entry) => entry.id),
    ["not-a-published-claim", "also-missing"],
  );
  assert.equal(briefing.complete, false, "the surface must be able to say so");
});

test("a duplicate reference is composed once and reported", () => {
  const [first] = publishedClaimIds(1);
  const briefing = compilePublicBriefing(
    { purpose: "technical", claimIds: [first, first] },
    "en",
  );
  assert.equal(briefing.sections.length, 1);
  assert.deepEqual(briefing.duplicates, [first]);
});

test("missing authored freshness stays null and is never generated", () => {
  const ids = publishedClaimIds(3);
  const briefing = compilePublicBriefing(
    { purpose: "release", claimIds: ids },
    "en",
  );
  for (const section of briefing.sections) {
    const provenance = getPublicProvenance(section.subject, "en");
    assert.equal(section.freshness, provenance?.freshness ?? null);
    if (section.freshness !== null) {
      assert.match(
        section.freshness,
        /^\d{4}-\d{2}-\d{2}$/,
        "an authored date, not a generated one",
      );
    }
  }
});

test("injection-like ids are rejected and cannot reach the output", () => {
  const hostile = [
    "<script>alert(1)</script>",
    "../../etc/passwd",
    "claim:security-reporting-is-private",
    "javascript:alert(1)",
    "'; DROP TABLE claims; --",
    "a".repeat(400),
  ];
  const briefing = compilePublicBriefing(
    { purpose: "executive", claimIds: hostile },
    "en",
  );
  assert.deepEqual(briefing.sections, []);
  assert.equal(briefing.missing.length, hostile.length);
  assert.deepEqual(
    new Set(briefing.missing.map((entry) => entry.reason)),
    new Set(["unusable"]),
    "a malformed id is refused before it is ever looked up",
  );
  // A refusal is reported verbatim so the surface can explain it; what must never
  // happen is a hostile value becoming briefing content.
  const content = JSON.stringify(briefing.sections);
  for (const value of hostile) {
    assert.ok(!content.includes(value), `"${value}" must not become a section`);
  }
  assert.ok(
    !content.includes("<script"),
    "no markup reaches the briefing body",
  );
});

test("boundaries travel with the statement they qualify", () => {
  const ids = publishedClaimIds(3);
  const briefing = compilePublicBriefing(
    { purpose: "trust", claimIds: ids },
    "en",
  );
  for (const section of briefing.sections) {
    const provenance = getPublicProvenance(section.subject, "en");
    assert.deepEqual(section.boundary, provenance?.boundary ?? null);
  }
});

test("the briefing is deterministic across calls and across tick order", () => {
  const ids = publishedClaimIds(3);
  assert.ok(ids.length >= 2, "need at least two published claims");
  const forward = compilePublicBriefing(
    { purpose: "executive", claimIds: ids },
    "en",
  );
  const reverse = compilePublicBriefing(
    { purpose: "executive", claimIds: [...ids].reverse() },
    "en",
  );
  assert.deepEqual(forward.sections, reverse.sections);
  assert.deepEqual(
    forward,
    compilePublicBriefing({ purpose: "executive", claimIds: ids }, "en"),
  );
});

test("the purpose shapes which sections are included, not what they claim", () => {
  const ids = publishedClaimIds(3);
  const trust = compilePublicBriefing(
    { purpose: "trust", claimIds: ids },
    "en",
  );
  const release = compilePublicBriefing(
    { purpose: "release", claimIds: ids },
    "en",
  );
  // presentation may differ, but no section may gain a statement of its own
  for (const section of [...trust.sections, ...release.sections]) {
    assert.equal(
      section.statement,
      getPublicProvenance(section.subject, "en")?.statement,
    );
  }
});

test("the compiler introduces no network, model, storage, random or clock primitive", () => {
  const code = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(
    /(^|\s)\/\/.*$/gm,
    "",
  );
  for (const term of [
    "fetch(",
    "XMLHttpRequest",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "document.cookie",
    "Math.random",
    "Date.now",
    "new Date(",
    "setTimeout",
  ]) {
    assert.ok(
      !code.includes(term),
      `the deterministic compiler must not use ${term}`,
    );
  }
  assert.ok(
    ["fetch("].some((term) => `const x = fetch("/a")`.includes(term)),
    "scanner is not vacuous",
  );
});

test("the briefing does not restate the dossier: it composes the shared authority", () => {
  const ids = publishedClaimIds(2);
  const briefing = compilePublicBriefing(
    { purpose: "executive", claimIds: ids },
    "en",
  );
  const dossier = compilePublicDossier({ lang: "en", claimIds: ids });
  assert.deepEqual(
    briefing.sections.map((section) => section.subject),
    dossier.entries.map((entry) => entry.id),
    "the briefing follows the same canonical order as the dossier",
  );
});

test("#239 a claim the lens refuses never masquerades as proof downstream", () => {
  const refused = CLAIMS.find(
    (claim) => getPublicProvenance(claim.id, "en")?.unknown === true,
  );
  assert.ok(refused, "at least one self-only claim must be refused");

  // Briefing: the refused claim produces no section and is reported, never dropped.
  const briefing = compilePublicBriefing(
    { purpose: "trust", claimIds: [refused.id] },
    "en",
  );
  assert.equal(briefing.sections.length, 0, "a refused claim must not compose");
  assert.equal(
    briefing.complete,
    false,
    "the briefing must report incompleteness",
  );
  assert.ok(
    briefing.missing.some(
      (entry) => entry.id === refused.id && entry.reason === "not-public",
    ),
    "the refusal must be reported as missing, not silently dropped",
  );

  // Dossier: the statement may remain a bounded statement, but it carries no
  // sources — turning this into a rejection would be a published-claims
  // decision that belongs to the owner, not to this guard fix.
  const dossier = compilePublicDossier({ lang: "en", claimIds: [refused.id] });
  const entry = dossier.entries.find((item) => item.id === refused.id);
  if (entry) {
    assert.equal(
      entry.evidenceIds.length,
      0,
      "a refused claim must publish no sources",
    );
  }
});
