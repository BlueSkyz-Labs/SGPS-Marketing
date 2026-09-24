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
];

/**
 * A claim whose canonical chain is withdrawn or self-only resolves as unknown,
 * and the dossier must refuse it rather than publish it (issue #240 / H-01).
 * It therefore cannot be a resolvable fixture for the projection contract
 * above; its refusal is pinned by the dedicated negative test below instead of
 * being asserted as publishable, which is the behaviour that defect described.
 */
const REFUSED_SUBJECT = "registry-publishes-only-proven-products";

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

test("an existing claim refuses withdrawn evidence", () => {
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
    claim.evidenceIds.splice(
      0,
      claim.evidenceIds.length,
      ...originalEvidenceIds,
    );
  }
});

test("a claim whose chain has no genuine route publishes nothing", () => {
  for (const lang of LANGS) {
    const provenance = getPublicProvenance(REFUSED_SUBJECT, lang);
    assert.ok(provenance, `${REFUSED_SUBJECT} must resolve for ${lang}`);
    assert.equal(
      provenance.unknown,
      true,
      `${REFUSED_SUBJECT} (${lang}) must resolve as unknown`,
    );
    assert.equal(
      provenance.sourceRefs.length,
      0,
      `${REFUSED_SUBJECT} (${lang}) must expose no genuine source route`,
    );

    const result = compilePublicDossier({ claimIds: [REFUSED_SUBJECT], lang });
    assert.deepEqual(
      result.entries,
      [],
      `${REFUSED_SUBJECT} (${lang}) must not be published`,
    );
    assert.equal(
      result.complete,
      false,
      `${REFUSED_SUBJECT} (${lang}) must not report a complete dossier`,
    );
  }
});
