/**
 * C3-B Task 1 (G4) — product-to-proof selector contract.
 *
 * The selector decides what a product surface may show as proof. These tests
 * pin the fail-closed behaviour: nothing is authored here, nothing missing is
 * promoted, no non-public destination survives, and an undeclared capability
 * yields no chrome at all.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductProofLinks,
  getProductProofSummary,
  productProofCapabilityKey,
  PROOF_KINDS,
} from "../../src/lib/product-proof.ts";

const PRODUCT = {
  slug: "fixture-product",
  public: true,
  capabilities: ["Private vulnerability reporting", "Signed release evidence"],
  proof: {
    screenshot: {
      src: "/products/fixtures/fixture-product.png",
      alt: "Fixture product screenshot",
    },
    repositoryUrl: "https://github.com/BlueSkyz-Labs/fixture-product",
  },
};

const PRIVATE_PRODUCT = { ...PRODUCT, public: false };

/** Minimal shape of a resolved product claim from the Claim Fabric. */
const RESOLVED_CLAIM = {
  claim: {
    id: "fixture-claim",
    kind: "product",
    surface: "products",
    statement: { en: "Fixture claim", vi: "Tuyên bố kiểm thử" },
    evidenceIds: ["fixture-evidence"],
  },
  evidence: [
    {
      id: "fixture-evidence",
      kind: "artifact",
      href: {
        en: "/en/evidence/fixture-evidence/",
        vi: "/vi/evidence/fixture-evidence/",
      },
      label: { en: "Fixture evidence", vi: "Bằng chứng kiểm thử" },
    },
  ],
  boundaryId: "fixture-boundary",
  reviewId: "fixture-review",
  productSlugs: ["fixture-product"],
};

test("a non-public product publishes no proof at all", () => {
  assert.deepEqual(
    getProductProofLinks(PRIVATE_PRODUCT, "Private vulnerability reporting"),
    [],
  );
  assert.deepEqual(getProductProofLinks(PRIVATE_PRODUCT, undefined), []);
});

test("an undeclared capability yields no proof chrome", () => {
  assert.deepEqual(
    getProductProofLinks(PRODUCT, "Something the product never claimed"),
    [],
  );
  // The declared ones do resolve, and by key as well as by prose.
  assert.ok(
    getProductProofLinks(PRODUCT, "Private vulnerability reporting").length > 0,
  );
  assert.ok(
    getProductProofLinks(PRODUCT, "private-vulnerability-reporting").length > 0,
  );
});

test("only resolvable artifacts with public destinations survive", () => {
  const links = getProductProofLinks(
    PRODUCT,
    "Private vulnerability reporting",
  );
  assert.deepEqual(
    links.map((link) => [link.kind, link.href, link.truthState]),
    [
      ["screenshot", "/products/fixtures/fixture-product.png", "source-linked"],
      [
        "repository",
        "https://github.com/BlueSkyz-Labs/fixture-product",
        "source-linked",
      ],
    ],
  );

  const dropped = getProductProofLinks(
    {
      ...PRODUCT,
      proof: {
        screenshot: { src: "https://cdn.example.com/shot.png", alt: "remote" },
        publicUrl: "http://insecure.example.com/",
        repositoryUrl: "https://tonydemo.com/retired",
        documentationUrl: "/internal/docs/notes.md",
        privacyUrl: "https://blueskyzlabs.com/en/privacy/",
      },
    },
    "Private vulnerability reporting",
  );
  assert.deepEqual(
    dropped.map((link) => link.href),
    ["https://blueskyzlabs.com/en/privacy/"],
    "a remote screenshot, an insecure URL, a retired host or an internal path must never be published as proof",
  );
});

test("claim evidence is attached with its review and boundary, never borrowed", () => {
  const links = getProductProofLinks(
    PRODUCT,
    "Private vulnerability reporting",
    [RESOLVED_CLAIM],
    [{ slug: "fixture-product", name: "Fixture Product" }],
  );
  const evidence = links.find((link) => link.kind === "evidence");
  assert.ok(
    evidence,
    "resolved claim evidence must be reachable from a capability",
  );
  assert.deepEqual(
    {
      id: evidence.id,
      href: evidence.href,
      truthState: evidence.truthState,
      boundaryId: evidence.boundaryId,
      reviewId: evidence.reviewId,
    },
    {
      id: "fixture-evidence",
      href: "/en/evidence/fixture-evidence/",
      truthState: "reviewed",
      boundaryId: "fixture-boundary",
      reviewId: "fixture-review",
    },
  );

  const otherProduct = getProductProofLinks(
    { ...PRODUCT, slug: "other-product" },
    "Private vulnerability reporting",
    [RESOLVED_CLAIM],
    [{ slug: "fixture-product", name: "Fixture Product" }],
  );
  assert.equal(
    otherProduct.some((link) => link.kind === "evidence"),
    false,
    "a claim resolved for another product must not be borrowed",
  );

  // Borrowing guard: with a live registry that does not contain this product,
  // resolved product-claim evidence must not be attached to it. (Whether a
  // product claim resolves at all when the registry is EMPTY is the Claim
  // Fabric's own fail-closed rule, tested there - this selector never has to
  // second-guess a claim the fabric already resolved.)
  const unpublishedRegistry = getProductProofLinks(
    PRODUCT,
    "Private vulnerability reporting",
    [RESOLVED_CLAIM],
    [{ slug: "another-product", name: "Another Product" }],
  );
  assert.equal(
    unpublishedRegistry.some((link) => link.kind === "evidence"),
    false,
    "claim evidence for a product outside the live registry must not be attached",
  );
});

test("output is deterministic and ordered by the shared vocabulary", () => {
  const first = getProductProofLinks(
    PRODUCT,
    "Private vulnerability reporting",
    [RESOLVED_CLAIM],
    [{ slug: "fixture-product", name: "Fixture Product" }],
  );
  const second = getProductProofLinks(
    PRODUCT,
    "Private vulnerability reporting",
    [RESOLVED_CLAIM],
    [{ slug: "fixture-product", name: "Fixture Product" }],
  );
  assert.deepEqual(second, first);

  const order = first
    .filter((link) => link.kind !== "evidence")
    .map((link) => PROOF_KINDS.indexOf(link.kind));
  assert.deepEqual(
    order,
    [...order].sort((a, b) => a - b),
    "artifacts keep the declaration order of PROOF_KINDS",
  );
});

test("missing artifacts are reported as not published, not promoted", () => {
  const { published, missing } = getProductProofSummary(
    PRODUCT,
    "Private vulnerability reporting",
  );
  assert.deepEqual(
    published.map((link) => link.kind),
    ["screenshot", "repository"],
  );
  assert.deepEqual(
    missing,
    ["public-url", "documentation", "privacy", "security", "support"],
    "an absent artifact must be visible as missing rather than quietly dropped",
  );
  assert.equal(
    missing.includes("evidence"),
    false,
    "evidence is not an artifact kind; it exists only when the fabric resolves it",
  );
});

test("capability keys are deterministic and refuse to identify nothing", () => {
  assert.equal(
    productProofCapabilityKey("Private vulnerability reporting"),
    "private-vulnerability-reporting",
  );
  assert.equal(
    productProofCapabilityKey("  Signed release evidence  "),
    "signed-release-evidence",
  );
  assert.equal(
    productProofCapabilityKey("Private vulnerability reporting"),
    productProofCapabilityKey("private vulnerability reporting"),
  );
  assert.throws(() => productProofCapabilityKey("   "));
});
