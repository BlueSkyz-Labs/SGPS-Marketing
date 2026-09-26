import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync("src/lib/product-schema.ts", "utf8");
const config = readFileSync("src/content.config.ts", "utf8");

test("product truth models lifecycle, availability, proof and CTA", () => {
  for (const field of [
    "lifecycle",
    "availability",
    "publicLabel",
    "audience",
    "jobs",
    "capabilities",
    "platforms",
    "primaryAction",
    "proof",
    "featuredTier",
    "sourceRevision",
    "lastReviewedAt",
  ]) {
    assert.match(schema, new RegExp(field));
  }
  assert.match(schema, /A BlueSkyz Labs product/);
  assert.match(schema, /productMedia/);
  assert.match(config, /productSchema/);
});
