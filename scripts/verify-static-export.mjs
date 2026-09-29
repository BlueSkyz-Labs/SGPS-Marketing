import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import {
  findUnpublishedProductNameLeaksInDirectory,
  readProductPublicationRecords,
} from "./product-publication-output.mjs";

for (const file of ["dist/index.html", "dist/404.html"]) {
  assert.ok(existsSync(file), `${file} must exist`);
  assert.ok(statSync(file).size > 0, `${file} must not be empty`);
}

assert.ok(existsSync("dist/_headers"), "dist/_headers must exist");

const products = readProductPublicationRecords("src/content/products");

const leaks = findUnpublishedProductNameLeaksInDirectory(products, "dist");
assert.deepEqual(
  leaks,
  [],
  "unpublished product names must not enter public text outputs",
);

console.log("Static export verified");
