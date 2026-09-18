import assert from "node:assert/strict";
import test from "node:test";
import { resolvePublicClaim } from "../../src/lib/claims.ts";
import {
  buildPublicSgpsManifest,
  serializePublicSgpsManifest,
} from "../../src/lib/sgps-manifest.ts";

const PRODUCTS = [{ slug: "fixture-product", name: "Fixture Product" }];

function boundClaim(evidenceIds = ["ev-products-route"]) {
  return {
    id: "fixture-capability-proof",
    kind: "product",
    surface: "products",
    statement: {
      en: "Fixture capability statement that must not be serialized.",
      vi: "Tuyên bố năng lực kiểm thử không được phép serialize.",
    },
    evidenceIds,
    productBinding: {
      productSlug: "fixture-product",
      capabilityId: "secure-export",
    },
  };
}

test("SGPS manifest 1.1 exposes deterministic capability-proof references", () => {
  const resolved = resolvePublicClaim(boundClaim(), PRODUCTS);
  assert.ok(resolved);

  const manifest = buildPublicSgpsManifest(PRODUCTS, [resolved]);
  assert.equal(manifest.schemaVersion, "1.1");
  assert.equal(manifest.generatedFrom, "public-runtime-data");
  assert.deepEqual(manifest.productProof, [
    {
      productSlug: "fixture-product",
      capabilityId: "secure-export",
      claimId: "fixture-capability-proof",
      evidenceIds: ["ev-products-route"],
      urls: {
        en: "/en/evidence/fixture-capability-proof/",
        vi: "/vi/evidence/fixture-capability-proof/",
      },
      truthState: "source-linked",
    },
  ]);
});

test("private-reporting references never enter the machine passport", () => {
  const resolved = resolvePublicClaim(
    boundClaim(["ev-security-advisory", "ev-security-route"]),
    PRODUCTS,
  );
  assert.ok(resolved);

  const raw = serializePublicSgpsManifest(PRODUCTS, [resolved]);
  assert.doesNotMatch(raw, /ev-security-advisory|github\.com/i);
  assert.match(raw, /ev-security-route/);
});

test("machine passport leaks no authored claim prose or internal provenance", () => {
  const resolved = resolvePublicClaim(boundClaim(), PRODUCTS);
  assert.ok(resolved);

  const raw = serializePublicSgpsManifest(PRODUCTS, [resolved]);
  assert.doesNotMatch(raw, /Fixture capability statement/);
  assert.doesNotMatch(raw, /Tuyên bố năng lực kiểm thử/);
  assert.doesNotMatch(raw, /src\/|docs\/|\.github|workflow|refs\/|branch/i);
  assert.doesNotMatch(raw, /@/);
});

test("product-proof records have stable order", () => {
  const one = resolvePublicClaim({ ...boundClaim(), id: "z-proof" }, PRODUCTS);
  const two = resolvePublicClaim(
    {
      ...boundClaim(),
      id: "a-proof",
      productBinding: {
        productSlug: "fixture-product",
        capabilityId: "audit-log",
      },
    },
    PRODUCTS,
  );
  assert.ok(one);
  assert.ok(two);

  const records = buildPublicSgpsManifest(PRODUCTS, [one, two]).productProof;
  assert.deepEqual(
    records.map((item) => item.claimId),
    ["a-proof", "z-proof"],
  );
});
