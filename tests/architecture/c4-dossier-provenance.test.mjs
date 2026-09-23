import assert from "node:assert/strict";
import { test } from "node:test";
import { compilePublicDossier } from "../../src/lib/dossier.ts";
import { getPublicProvenance } from "../../src/lib/provenance-lens.ts";
import { CLAIMS } from "../../src/data/claims.ts";

/**
 * C4-D Task 5 — dossier↔provenance integration contract.
 *
 * The dossier must not own a second provenance authority: every source block it
 * publishes has to be a projection of what the provenance adapter resolves for
 * the same public subject id.
 */

const LANGS = ["en", "vi", "zh"];
const SUBJECTS = [
  "security-reporting-is-private",
  "privacy-no-tracking-on-this-site",
  "registry-publishes-only-proven-products",
];

test("every dossier source block projects the provenance adapter for the same subject", () => {
  for (const lang of LANGS) {
    for (const subject of SUBJECTS) {
      const provenance = getPublicProvenance(subject, lang);
      assert.ok(provenance, `${subject} must resolve for ${lang}`);
      const dossier = compilePublicDossier({ claimIds: [subject], lang });
      const entry = dossier.entries.find((item) => item.id === subject);
      assert.ok(entry, `${subject} must appear in the ${lang} dossier`);

      const expected = provenance.sourceRefs.map((reference) => reference.id);
      assert.deepEqual(
        entry.evidenceIds,
        expected,
        `${subject} (${lang}) source block must be the adapter's projection`,
      );
      assert.equal(
        entry.freshness,
        provenance.freshness,
        `${subject} (${lang}) freshness must come from the same authority`,
      );
    }
  }
});

test("dossier evidence blocks carry the adapter's label and destination verbatim", () => {
  for (const lang of LANGS) {
    for (const subject of SUBJECTS) {
      const provenance = getPublicProvenance(subject, lang);
      assert.ok(provenance);
      for (const reference of provenance.sourceRefs) {
        const dossier = compilePublicDossier({
          evidenceIds: [reference.id],
          lang,
        });
        const entry = dossier.entries.find((item) => item.id === reference.id);
        assert.ok(entry, `${reference.id} must publish in the ${lang} dossier`);
        assert.equal(
          entry.label,
          reference.label,
          `${reference.id} label must not be re-derived`,
        );
        assert.equal(
          entry.href,
          reference.href,
          `${reference.id} destination must not be re-derived`,
        );
      }
    }
  }
});

test("a subject the provenance adapter refuses never publishes in the dossier", () => {
  for (const lang of LANGS) {
    const provenance = getPublicProvenance("not-a-published-subject", lang);
    assert.ok(
      provenance === null || provenance.unknown,
      "unknown subjects stay unknown",
    );

    const asClaim = compilePublicDossier({
      claimIds: ["not-a-published-subject"],
      lang,
    });
    assert.deepEqual(
      asClaim.entries,
      [],
      `${lang}: refused claim must not render`,
    );
    assert.equal(
      asClaim.complete,
      false,
      `${lang}: a refusal must be reported, not hidden`,
    );

    const asEvidence = compilePublicDossier({
      evidenceIds: ["not-a-published-subject"],
      lang,
    });
    assert.deepEqual(
      asEvidence.entries,
      [],
      `${lang}: refused evidence must not render`,
    );
  }
});

test("dossier source blocks stay deterministic across repeated compiles", () => {
  const first = compilePublicDossier({ claimIds: SUBJECTS, lang: "en" });
  const second = compilePublicDossier({ claimIds: SUBJECTS, lang: "en" });
  assert.deepEqual(first, second);
});

test("a still-registered claim becomes unpublishable if all its evidence disappears", () => {
  const claim = CLAIMS.find(
    (entry) => entry.id === "registry-publishes-only-proven-products",
  );
  assert.ok(claim, "fixture must use a real canonical claim");
  const originalEvidenceIds = [...claim.evidenceIds];
  assert.ok(originalEvidenceIds.length > 0, "test must remove real evidence");

  // Simulate source withdrawal without removing the registered claim. The
  // canonical provenance adapter then refuses it; the dossier must also refuse.
  try {
    claim.evidenceIds.splice(
      0,
      claim.evidenceIds.length,
      "ev-withdrawn-from-public-registry",
    );
    for (const lang of LANGS) {
      const provenance = getPublicProvenance(claim.id, lang);
      assert.ok(provenance?.unknown, `${lang}: adapter must refuse evidence`);
      const result = compilePublicDossier({ claimIds: [claim.id], lang });
      assert.deepEqual(result.entries, [], `${lang}: no unproven statement`);
      assert.deepEqual(result.rejected, [
        { id: claim.id, section: "claims", reason: "not-public" },
      ]);
      assert.equal(result.complete, false);
    }
  } finally {
    claim.evidenceIds.splice(0, claim.evidenceIds.length, ...originalEvidenceIds);
  }
});

test("a self-only chain must not publish its existing claim", () => {
  const claim = CLAIMS.find(
    (entry) => entry.id === "registry-publishes-only-proven-products",
  );
  assert.ok(claim);
  const originalSurface = claim.surface;

  try {
    for (const lang of LANGS) {
      claim.surface = originalSurface;
      const existing = getPublicProvenance(claim.id, lang);
      assert.ok(existing?.sourceRefs.length === 1);
      claim.surface = existing.sourceRefs[0].href;
      assert.equal(getPublicProvenance(claim.id, lang)?.unknown, true);
      const result = compilePublicDossier({ claimIds: [claim.id], lang });
      assert.deepEqual(result.entries, []);
      assert.equal(result.complete, false);
    }
  } finally {
    claim.surface = originalSurface;
  }
});
