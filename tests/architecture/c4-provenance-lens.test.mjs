import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CLAIMS, EVIDENCE_INDEX } from "../../src/data/claims.ts";
import {
  getPublicProvenance,
  isSelfOnlyChain,
} from "../../src/lib/provenance-lens.ts";

const CLAIM = "security-reporting-is-private";
const LANGS = ["en", "vi", "zh"];

test("the canonical sources really carry what this lens filters", () => {
  const claim = CLAIMS.find((entry) => entry.id === CLAIM);
  assert.ok(claim, "the subject must exist in the canonical claim fabric");
  assert.ok(claim.evidenceIds.length > 0, "the subject must declare evidence");
  assert.ok(EVIDENCE_INDEX.size > 0, "the evidence index must not be empty");
});

test("a published claim resolves to canonical sources, never invented ones", () => {
  const provenance = getPublicProvenance(CLAIM, "en");
  assert.ok(provenance, "a published subject must resolve");
  assert.equal(provenance.unknown, false);
  assert.ok(
    provenance.sourceRefs.length > 0,
    "a resolved chain must carry sources",
  );
  for (const ref of provenance.sourceRefs) {
    const canonical = EVIDENCE_INDEX.get(ref.id);
    assert.ok(canonical, `source ${ref.id} must exist in the canonical index`);
    assert.equal(ref.href, canonical.href.en);
    assert.equal(ref.label, canonical.label.en);
  }
});

test("an unknown, empty or unpublished subject fails closed", () => {
  for (const subject of [
    "",
    "claim-that-does-not-exist",
    "ev-not-real",
    "bnd-imaginary",
  ]) {
    assert.equal(
      getPublicProvenance(subject, "en"),
      null,
      `${subject} must not resolve`,
    );
  }
});

test("a subject that only cites itself is refused, not dressed as proof", () => {
  const refs = [
    { id: "ev-a", label: "A", href: "/en/security/" },
    { id: "ev-b", label: "B", href: "/en/security/" },
  ];
  assert.equal(
    isSelfOnlyChain(refs, "/en/security/"),
    true,
    "an all-self chain must be refused",
  );
  assert.equal(
    isSelfOnlyChain(
      [...refs, { id: "ev-c", label: "C", href: "https://example.com/report" }],
      "/en/security/",
    ),
    false,
    "one independent source is enough to be a chain",
  );
  assert.equal(
    isSelfOnlyChain([], "/en/security/"),
    false,
    "an empty chain is not a self chain",
  );

  // the live subject must cite at least one independent source, or the lens
  // would report it as unknown rather than publish a convincing chain
  const claim = CLAIMS.find((entry) => entry.id === CLAIM);
  assert.ok(claim);
  const live = claim.evidenceIds
    .map((id) => EVIDENCE_INDEX.get(id))
    .filter(Boolean)
    .map((ref) => ({ id: ref.id, label: ref.label.en, href: ref.href.en }));
  assert.equal(
    isSelfOnlyChain(live, claim.surface),
    false,
    "the live subject must not be a self-only chain",
  );
});

test("destinations are public and freshness is authored only", () => {
  for (const lang of LANGS) {
    const provenance = getPublicProvenance(CLAIM, lang);
    assert.ok(provenance);
    for (const ref of provenance.sourceRefs) {
      assert.ok(
        ref.href.startsWith("https://") ||
          (ref.href.startsWith("/") && !ref.href.startsWith("//")),
        `destination must be public: ${ref.href}`,
      );
      assert.equal(
        ref.href.includes(".."),
        false,
        "no traversal in a destination",
      );
    }
    if (provenance.freshness !== null) {
      assert.match(provenance.freshness, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
  const source = readFileSync(
    new URL("../../src/lib/provenance-lens.ts", import.meta.url),
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
      `lens must stay deterministic: ${banned}`,
    );
  }
});

test("no chain carries unsupported assurance vocabulary", () => {
  for (const lang of LANGS) {
    const provenance = getPublicProvenance(CLAIM, lang);
    assert.ok(provenance);
    const text = [
      provenance.statement,
      ...provenance.sourceRefs.map((ref) => ref.label),
      provenance.boundary?.claim ?? "",
      provenance.boundary?.doesNotImply ?? "",
    ]
      .join(" ")
      .toLowerCase();
    for (const banned of [
      "certified",
      "audited",
      "guaranteed",
      "compliant",
      "accredited",
    ]) {
      assert.equal(
        text.includes(banned),
        false,
        `${lang} chain claims ${banned}`,
      );
    }
  }
});

test("locale parity: every language resolves the same source identities", () => {
  const identity = (lang) =>
    getPublicProvenance(CLAIM, lang)
      .sourceRefs.map((ref) => ref.id)
      .sort();
  const english = identity("en");
  for (const lang of LANGS) {
    assert.deepEqual(
      identity(lang),
      english,
      `${lang} must resolve the same sources`,
    );
  }
});

test("the lens is deterministic and rejects a malformed language", () => {
  assert.deepEqual(
    getPublicProvenance(CLAIM, "en"),
    getPublicProvenance(CLAIM, "en"),
  );
  const fallback = getPublicProvenance(CLAIM, "fr");
  assert.equal(fallback.statement, getPublicProvenance(CLAIM, "en").statement);
});

// ---------------------------------------------------------------------------
// Issue #239 — the guard compared a logical surface id with a localized URL.
// These fixtures keep the canonical surface id UNCHANGED and use the actual
// per-language hrefs, so a pass means the identity mismatch is really closed.
// ---------------------------------------------------------------------------

const SELF_ONLY = "registry-publishes-only-proven-products";
const ref = (href, id = "ev-products-route", kind = "route") => ({
  id,
  kind,
  href,
  label: { en: id, vi: id, zh: id },
});

test("#239 a claim whose only source is its own surface is refused in EN/VI/zh", () => {
  const claim = CLAIMS.find((entry) => entry.id === SELF_ONLY);
  assert.ok(claim, "the candidate claim must exist");
  assert.equal(
    claim.surface,
    "products",
    "the surface id stays a logical id — the test must not mutate it into a URL",
  );
  for (const lang of LANGS) {
    const provenance = getPublicProvenance(SELF_ONLY, lang);
    assert.ok(provenance, `${lang} must refuse deterministically`);
    assert.equal(
      provenance.unknown,
      true,
      `${lang} must mark the chain unknown`,
    );
    assert.equal(
      provenance.sourceRefs.length,
      0,
      `${lang} must publish no source for a self-only chain`,
    );
  }
});

test("#239 locale mismatch: another locale of the same surface is still self", () => {
  const claim = CLAIMS.find((entry) => entry.id === SELF_ONLY);
  const canonical = EVIDENCE_INDEX.get("ev-products-route");
  for (const lang of LANGS) {
    const href = canonical.href[lang];
    assert.ok(href?.startsWith("/"), `${lang} route evidence must resolve`);
    assert.equal(
      isSelfOnlyChain([ref(href)], claim.surface),
      true,
      `${lang} href ${href} must count as the claim's own surface`,
    );
  }
  // an English claim citing the Vietnamese URL of its own surface
  assert.equal(
    isSelfOnlyChain([ref(canonical.href.vi)], claim.surface),
    true,
    "a locale sibling of the own surface is not independent",
  );
});

test("#239 query and fragment are normalized away before comparing", () => {
  const claim = CLAIMS.find((entry) => entry.id === SELF_ONLY);
  for (const suffix of ["?utm=1", "#section", "?a=b#c"]) {
    assert.equal(
      isSelfOnlyChain([ref(`/en/products/${suffix}`)], claim.surface),
      true,
      `${suffix} must normalize back to the own surface`,
    );
  }
});

test("#239 external and unsafe destinations are never treated as self", () => {
  const claim = CLAIMS.find((entry) => entry.id === SELF_ONLY);
  for (const href of [
    "https://independent.example/report",
    "http://independent.example/report",
    "//independent.example/report",
    "/en/products/../../../etc/passwd",
  ]) {
    assert.equal(
      isSelfOnlyChain([ref(href)], claim.surface),
      false,
      `${href} must not be mistaken for the own surface`,
    );
  }
});

test("#239 a missing route mapping fails closed instead of opening the guard", () => {
  const refs = [ref("/en/nowhere/", "ev-nowhere-route")];
  assert.equal(
    isSelfOnlyChain(refs, "nowhere-surface"),
    true,
    "with no canonical route to compare against, route-only refs stay self",
  );
  assert.equal(
    isSelfOnlyChain(refs, undefined),
    false,
    "an absent surface cannot claim self-identity",
  );
});

test("#239 one genuinely independent source keeps the chain publishable", () => {
  const claim = CLAIMS.find((entry) => entry.id === SELF_ONLY);
  const chain = [
    ref("/en/products/"),
    ref("https://independent.example/report", "ev-independent", "artifact"),
  ];
  assert.equal(
    isSelfOnlyChain(chain, claim.surface),
    false,
    "an independent artifact must break self-only",
  );
});
