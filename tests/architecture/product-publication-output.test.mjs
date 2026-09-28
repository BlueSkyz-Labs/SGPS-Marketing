import assert from "node:assert/strict";
import test from "node:test";
import { findUnpublishedProductNameLeaks } from "../../scripts/product-publication-output.mjs";

test("unpublished product names are rejected from public text outputs", () => {
  const leaks = findUnpublishedProductNameLeaks(
    [{ name: "Hidden Product", public: false }],
    [
      { path: "index.html", contents: "Visible company page" },
      { path: "manifest.json", contents: '{"title":"Hidden Product"}' },
    ],
  );

  assert.deepEqual(leaks, ["manifest.json: Hidden Product"]);
});

test("published product names and unrelated public assets are allowed", () => {
  const leaks = findUnpublishedProductNameLeaks(
    [{ name: "Published Product", public: true }],
    [{ path: "products/index.html", contents: "Published Product" }],
  );

  assert.deepEqual(leaks, []);
});
