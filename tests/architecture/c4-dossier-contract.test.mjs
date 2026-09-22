import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  BOUNDARY_INDEX,
  CLAIMS,
  EVIDENCE_INDEX,
} from "../../src/data/claims.ts";
import {
  DOSSIER_SECTIONS,
  compilePublicDossier,
} from "../../src/lib/dossier.ts";

const CLAIM_ID = "security-reporting-is-private";
const EVIDENCE_ID = "ev-security-advisory";
const BOUNDARY_ID = "bnd-security-reporting";

test("a fully published selection compiles every requested section", () => {
  const dossier = compilePublicDossier({
    lang: "en",
    claimIds: [CLAIM_ID],
    evidenceIds: [EVIDENCE_ID],
    boundaryIds: [BOUNDARY_ID],
  });
  assert.equal(dossier.complete, true);
  assert.deepEqual(dossier.rejected, []);
  assert.deepEqual(
    dossier.entries.map((entry) => entry.id),
    [CLAIM_ID, EVIDENCE_ID, BOUNDARY_ID],
  );
  assert.deepEqual(
    dossier.entries.map((entry) => entry.section),
    ["claims", "evidence", "boundaries"],
  );
  for (const entry of dossier.entries) {
    assert.ok(
      entry.label.length > 0,
      `${entry.id} must carry a localized label`,
    );
  }
});

test("an unknown or unpublished id fails closed instead of rendering", () => {
  const dossier = compilePublicDossier({
    lang: "en",
    claimIds: [CLAIM_ID, "claim-that-does-not-exist"],
    evidenceIds: ["ev-not-real"],
    boundaryIds: ["bnd-imaginary"],
  });
  assert.equal(dossier.complete, false);
  assert.deepEqual(
    dossier.entries.map((entry) => entry.id),
    [CLAIM_ID],
  );
  assert.deepEqual(
    dossier.rejected.map((entry) => [entry.id, entry.reason]),
    [
      ["claim-that-does-not-exist", "not-public"],
      ["ev-not-real", "not-public"],
      ["bnd-imaginary", "not-public"],
    ],
  );
});

test("a duplicated id is rendered once and reported", () => {
  const dossier = compilePublicDossier({
    lang: "en",
    claimIds: [CLAIM_ID, CLAIM_ID],
  });
  assert.equal(
    dossier.entries.filter((entry) => entry.id === CLAIM_ID).length,
    1,
  );
  assert.deepEqual(dossier.rejected, [
    { id: CLAIM_ID, section: "claims", reason: "duplicate" },
  ]);
  assert.equal(dossier.complete, false);
});

test("destinations come from the canonical source, never invented", () => {
  const dossier = compilePublicDossier({
    lang: "vi",
    claimIds: [CLAIM_ID],
    evidenceIds: [EVIDENCE_ID],
  });
  const claim = dossier.entries.find((entry) => entry.section === "claims");
  const evidence = dossier.entries.find(
    (entry) => entry.section === "evidence",
  );
  const canonical = EVIDENCE_INDEX.get(EVIDENCE_ID);
  assert.ok(canonical, "the evidence id must exist in the canonical index");
  assert.equal(evidence.href, canonical.href.vi);
  assert.equal(evidence.label, canonical.label.vi);
  assert.ok(
    claim.href === null ||
      (claim.href.startsWith("/") && !claim.href.includes("//")),
    "a claim destination is a served route or null",
  );
});

test("freshness is an authored date, never a runtime clock", () => {
  const dossier = compilePublicDossier({ lang: "en", claimIds: [CLAIM_ID] });
  const entry = dossier.entries[0];
  if (entry.freshness !== null) {
    assert.match(entry.freshness, /^\d{4}-\d{2}-\d{2}$/);
  }
  const source = readFileSync(
    new URL("../../src/lib/dossier.ts", import.meta.url),
    "utf8",
  );
  for (const banned of [
    "Date.now",
    "new Date(",
    "Math.random",
    "fetch(",
    "localStorage",
  ]) {
    assert.equal(
      source.includes(banned),
      false,
      `the compiler must stay deterministic: found ${banned}`,
    );
  }
});

test("compilation is deterministic and order-stable", () => {
  const request = {
    lang: "en",
    claimIds: [CLAIM_ID],
    evidenceIds: [EVIDENCE_ID, "ev-not-real"],
  };
  const first = compilePublicDossier(request);
  const second = compilePublicDossier({ ...request });
  assert.deepEqual(first, second);
  assert.deepEqual(first.sections, [...DOSSIER_SECTIONS]);
});

test("sections are filtered by request and unknown section names are ignored", () => {
  const dossier = compilePublicDossier({
    lang: "en",
    sections: ["evidence", "not-a-section"],
    claimIds: [CLAIM_ID],
    evidenceIds: [EVIDENCE_ID],
  });
  assert.deepEqual(dossier.sections, ["evidence"]);
  assert.deepEqual(
    dossier.entries.map((entry) => entry.section),
    ["evidence"],
  );
});

test("every localized language resolves and an unknown language falls back to en", () => {
  for (const lang of ["en", "vi", "zh"]) {
    const dossier = compilePublicDossier({ lang, evidenceIds: [EVIDENCE_ID] });
    assert.ok(dossier.entries[0].label.length > 0, `${lang} must localize`);
  }
  const fallback = compilePublicDossier({
    lang: "fr",
    evidenceIds: [EVIDENCE_ID],
  });
  assert.equal(fallback.lang, "en");
  assert.equal(
    fallback.entries[0].label,
    EVIDENCE_INDEX.get(EVIDENCE_ID).label.en,
  );
});

test("the compiler only reads canonical public selectors", () => {
  const source = readFileSync(
    new URL("../../src/lib/dossier.ts", import.meta.url),
    "utf8",
  );
  for (const id of [CLAIM_ID, EVIDENCE_ID, BOUNDARY_ID]) {
    assert.equal(
      source.includes(id),
      false,
      `no id may be hard-coded in the compiler: ${id}`,
    );
  }
  assert.ok(
    CLAIMS.length > 0 && BOUNDARY_INDEX.size > 0 && EVIDENCE_INDEX.size > 0,
  );
});
