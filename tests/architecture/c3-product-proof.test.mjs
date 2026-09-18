/**
 * C3-B Task 1 (G4) — capability-bound product-to-proof contract.
 *
 * A product capability may reach proof only through an explicit canonical
 * Claim Fabric binding. Generic product artifacts or product-level claims are
 * not capability proof.
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
    "C3-B Task 1 requires src/lib/product-proof.ts before proof can resolve",
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

test("resolvable proof requires an explicit product + capability binding", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(
    productClaim({
      boundaryId: "bnd-privacy-collection",
      reviewId: "privacy-data-practices",
    }),
    PRODUCTS,
  );
  assert.ok(resolved, "fixture claim must resolve through the canonical fabric");

  const links = getProductProofLinks(
    "fixture-product",
    "secure-export",
    PRODUCTS,
    [resolved],
  );

  assert.equal(links.length, 1);
  assert.deepEqual(links[0], {
    claimId: "fixture-capability-proof",
    evidenceId: "ev-products-route",
    href: { en: "/en/products/", vi: "/vi/products/" },
    label: { en: "Products route", vi: "Trang Sản phẩm" },
    truthState: "source-linked",
    boundary: {
      id: "bnd-privacy-collection",
      claim: {
        en: "This site sets no cookies, uses no client storage, and performs no tracking or profiling.",
        vi: "Trang này không đặt cookie, không dùng lưu trữ phía trình duyệt, và không theo dõi hay lập hồ sơ.",
      },
      doesNotImply: {
        en: "It does not establish that no data at all is processed: serving any website still requires infrastructure to handle network-level metadata such as IP addresses and request headers.",
        vi: "Nó không xác lập rằng không có dữ liệu nào được xử lý: mọi website vẫn cần hạ tầng xử lý siêu dữ liệu mạng như địa chỉ IP và header yêu cầu.",
      },
    },
    passportHref: {
      en: "/en/evidence/fixture-capability-proof/",
      vi: "/vi/evidence/fixture-capability-proof/",
    },
  });
});

test("missing evidence fails closed instead of manufacturing proof", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const unresolved = resolvePublicClaim(
    productClaim({ evidenceIds: ["ev-does-not-exist"] }),
    PRODUCTS,
  );
  assert.equal(unresolved, null);
  assert.deepEqual(
    getProductProofLinks("fixture-product", "secure-export", PRODUCTS, []),
    [],
  );
});

test("private-reporting evidence is never capability proof", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(
    productClaim({ evidenceIds: ["ev-security-advisory"] }),
    PRODUCTS,
  );
  assert.ok(resolved);
  assert.deepEqual(
    getProductProofLinks(
      "fixture-product",
      "secure-export",
      PRODUCTS,
      [resolved],
    ),
    [],
  );
});

test("unknown product and unknown capability cannot borrow generic product proof", async () => {
  const { getProductProofLinks } = await loadProofModule();

  const wrongProduct = resolvePublicClaim(
    productClaim({ productSlug: "ghost-product" }),
    PRODUCTS,
  );
  assert.equal(
    wrongProduct,
    null,
    "a bound product claim must fail when its product is not public",
  );

  const resolved = resolvePublicClaim(productClaim(), PRODUCTS);
  assert.ok(resolved);

  assert.deepEqual(
    getProductProofLinks("fixture-product", "different-capability", PRODUCTS, [
      resolved,
    ]),
    [],
  );
  assert.deepEqual(
    getProductProofLinks("ghost-product", "secure-export", PRODUCTS, [resolved]),
    [],
  );
});

test("unbound generic product claims never become capability proof", async () => {
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
    getProductProofLinks("fixture-product", "secure-export", PRODUCTS, [generic]),
    [],
  );
});

test("selector output is deterministic", async () => {
  const { getProductProofLinks } = await loadProofModule();
  const resolved = resolvePublicClaim(productClaim(), PRODUCTS);
  assert.ok(resolved);

  const first = getProductProofLinks(
    "fixture-product",
    "secure-export",
    PRODUCTS,
    [resolved],
  );
  const second = getProductProofLinks(
    "fixture-product",
    "secure-export",
    PRODUCTS,
    [resolved],
  );
  assert.deepEqual(second, first);
});
