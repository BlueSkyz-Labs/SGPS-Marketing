/**
 * C3-B Task 1 (G4) — capability-bound product-to-proof contract.
 *
 * Capability proof requires an explicit canonical Claim Fabric binding.
 * Generic product artifacts and generic product claims are not proof of an
 * individual capability.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { resolvePublicClaim } from "../../src/lib/claims.ts";

const PROOF_MODULE = "src/lib/product-proof.ts";
const PRODUCTS = [{ slug: "fixture-product", name: "Fixture Product" }];

async function loadProofModule() {
  assert.ok(
    existsSync(PROOF_MODULE),
    "C3-B Task 1 requires src/lib/product-proof.ts",
  );
  return import("../../src/lib/product-proof.ts");
}

function productClaim({
  id = "fixture-capability-proof",
  productSlug = "fixture-product",
  capabilityId = "secure-export",
  evidenceIds = ["ev-products-route"],
  boundaryId,
  reviewId,
} = {}) {
  return {
    id,
    kind: "product",
    surface: "products",
    statement: {
      en: "Fixture capability proof",
      vi: "Bằng chứng năng lực kiểm thử",
    },
    evidenceIds,
    productBinding: { productSlug, capabilityId },
    ...(boundaryId ? { boundaryId } : {}),
    ...(reviewId ? { reviewId } : {}),
  };
}

function proofLinks(
  selector,
  capabilityId,
  claims,
  productSlug = "fixture-product",
) {
  return selector(productSlug, capabilityId, PRODUCTS, claims);
}

test("resolvable proof requires explicit capability binding", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(
    productClaim({
      boundaryId: "bnd-privacy-collection",
      reviewId: "privacy-data-practices",
    }),
    PRODUCTS,
  );
  assert.ok(resolved);

  const links = proofLinks(getProductProofLinks, "secure-export", [resolved]);
  assert.equal(links.length, 1);

  const [link] = links;
  assert.equal(link.claimId, "fixture-capability-proof");
  assert.equal(link.evidenceId, "ev-products-route");
  assert.deepEqual(link.href, {
    en: "/en/products/",
    vi: "/vi/products/",
  });
  assert.equal(link.truthState, "source-linked");
  assert.equal(link.boundary?.id, "bnd-privacy-collection");
  assert.deepEqual(link.passportHref, {
    en: "/en/evidence/fixture-capability-proof/",
    vi: "/vi/evidence/fixture-capability-proof/",
  });
});

test("missing evidence fails closed", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const unresolved = resolvePublicClaim(
    productClaim({ evidenceIds: ["ev-does-not-exist"] }),
    PRODUCTS,
  );
  assert.equal(unresolved, null);
  assert.deepEqual(proofLinks(getProductProofLinks, "secure-export", []), []);
});

test("private-reporting evidence is not capability proof", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(
    productClaim({ evidenceIds: ["ev-security-advisory"] }),
    PRODUCTS,
  );
  assert.ok(resolved);
  assert.deepEqual(
    proofLinks(getProductProofLinks, "secure-export", [resolved]),
    [],
  );
});

test("a bound claim rejects an unknown public product", () => {
  const resolved = resolvePublicClaim(
    productClaim({ productSlug: "ghost-product" }),
    PRODUCTS,
  );
  assert.equal(resolved, null);
});

test("unknown capability cannot borrow product proof", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(productClaim(), PRODUCTS);
  assert.ok(resolved);
  assert.deepEqual(
    proofLinks(getProductProofLinks, "different-capability", [resolved]),
    [],
  );
});

test("unknown product cannot borrow capability proof", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(productClaim(), PRODUCTS);
  assert.ok(resolved);
  assert.deepEqual(
    proofLinks(
      getProductProofLinks,
      "secure-export",
      [resolved],
      "ghost-product",
    ),
    [],
  );
});

test("generic product claims never become capability proof", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const generic = resolvePublicClaim(
    {
      id: "generic-product-claim",
      kind: "product",
      surface: "products",
      statement: {
        en: "Generic product publication claim",
        vi: "Tuyên bố công bố sản phẩm chung",
      },
      evidenceIds: ["ev-products-route"],
    },
    PRODUCTS,
  );
  assert.ok(generic);
  assert.deepEqual(
    proofLinks(getProductProofLinks, "secure-export", [generic]),
    [],
  );
});

test("selector output is deterministic", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(productClaim(), PRODUCTS);
  assert.ok(resolved);

  const first = proofLinks(getProductProofLinks, "secure-export", [resolved]);
  const second = proofLinks(getProductProofLinks, "secure-export", [resolved]);
  assert.deepEqual(second, first);
});
