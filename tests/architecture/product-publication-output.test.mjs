import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  findUnpublishedProductNameLeaks,
  findUnpublishedProductNameLeaksInDirectory,
  readProductPublicationRecords,
} from "../../scripts/product-publication-output.mjs";

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

test("built HTML, JSON and TXT reject names from unpublished product records", () => {
  const directory = mkdtempSync(join(tmpdir(), "product-publication-output-"));
  try {
    mkdirSync(join(directory, "brand"));
    const products = readProductPublicationRecords("src/content/products");
    const hiddenNames = products
      .filter((product) => !product.public)
      .map((product) => product.name);
    assert.ok(hiddenNames.length > 0, "registry must include hidden products");
    const hiddenNamesText = hiddenNames.join(" ");
    writeFileSync(join(directory, "index.html"), hiddenNamesText);
    writeFileSync(
      join(directory, "manifest.json"),
      JSON.stringify({ name: hiddenNamesText }),
    );
    writeFileSync(join(directory, "llms.txt"), hiddenNamesText);
    writeFileSync(join(directory, "brand", "identity.svg"), hiddenNamesText);

    const leaks = findUnpublishedProductNameLeaksInDirectory(
      products,
      directory,
    );
    assert.equal(leaks.length, hiddenNames.length * 3);
    assert.deepEqual(
      new Set(leaks.map((leak) => leak.split(":")[0])),
      new Set(["index.html", "manifest.json", "llms.txt"]),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
