/**
 * SGPS-DEC-2026-039 Part B (product-to-web admission), mapped into the product
 * registry contract: the site shows a product no further than the product's
 * own release truth. A live listing (`active` / `maintenance`) needs its merged
 * go-live gate record, the deployed exact SHA and a real UI screenshot in the
 * same record; a preview does not. Each rule has a negative proof.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { productSchema } from "../../src/lib/product-schema.ts";

const GATE = {
  record: "https://github.com/BlueSkyz-Labs/demo/blob/main/docs/release/GO.md",
  deployedSha: "0123456789abcdef0123456789abcdef01234567",
};
const SCREENSHOT = {
  kind: "ui-screenshot",
  src: "/products/demo-product/today.webp",
  alt: "Demo Product today screen",
  width: 780,
  height: 1688,
};

function product(overrides = {}) {
  return {
    slug: "demo-product",
    name: "Demo Product",
    shortDescription: "A truthful demo product entry for schema probes.",
    lifecycle: "active",
    availability: "public",
    publicLabel: "Available",
    audience: ["individual"],
    jobs: ["Understand status"],
    capabilities: ["Shows status", "Links to proof"],
    platforms: ["web"],
    primaryAction: {
      type: "open",
      label: "Open product",
      href: "https://product.blueskyz.labs/",
    },
    proof: { publicUrl: "https://product.blueskyz.labs/", media: SCREENSHOT },
    releaseGate: GATE,
    endorsement: "A BlueSkyz Labs product",
    featuredTier: "featured",
    displayOrder: 1,
    public: true,
    sourceRevision: "abcdef1",
    lastReviewedAt: "2026-10-16",
    ...overrides,
  };
}

const issues = (record) => {
  const result = productSchema.safeParse(record);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."));
};

test("a live product with gate record, deployed SHA and screenshot is admitted", () => {
  assert.deepEqual(issues(product()), []);
  assert.deepEqual(issues(product({ lifecycle: "maintenance" })), []);
});

test("negative proof: live without a release gate is rejected", () => {
  assert.deepEqual(issues(product({ releaseGate: undefined })), [
    "releaseGate",
  ]);
});

test("negative proof: a short or non-hex deployed SHA is rejected", () => {
  for (const deployedSha of ["0123456", "Z".repeat(40)]) {
    assert.deepEqual(
      issues(product({ releaseGate: { ...GATE, deployedSha } })),
      ["releaseGate.deployedSha"],
    );
  }
});

test("negative proof: live with identity art instead of a UI screenshot is rejected", () => {
  assert.deepEqual(
    issues(
      product({
        proof: {
          publicUrl: "https://product.blueskyz.labs/",
          media: { ...SCREENSHOT, kind: "identity-art" },
        },
      }),
    ),
    ["proof.media"],
  );
  assert.deepEqual(
    issues(product({ proof: { publicUrl: "https://product.blueskyz.labs/" } })),
    ["proof.media"],
  );
});

test("a preview needs no release gate (MERGED != DEPLOYED stays preview)", () => {
  for (const lifecycle of ["development", "beta"]) {
    assert.deepEqual(
      issues(
        product({
          lifecycle,
          availability: "preview",
          publicLabel: "Preview",
          primaryAction: {
            type: "explore",
            label: "See Demo Product",
            href: "https://product.blueskyz.labs/",
          },
          releaseGate: undefined,
          proof: { publicUrl: "https://product.blueskyz.labs/" },
        }),
      ),
      [],
      lifecycle,
    );
  }
});
