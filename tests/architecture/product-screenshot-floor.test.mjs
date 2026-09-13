/**
 * Screenshot floor scaffold (owner decision #125 C1c, pending).
 * The frame is built; the mandate is not flipped. This test pins the CURRENT
 * contract — screenshot optional, render paths screenshot-tolerant — so the
 * day the owner supplies real /products/... assets, the flip is one line in
 * src/lib/product-schema.ts plus asset pointers per product, and this test is
 * updated to assert the mandatory floor instead of the optional one.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync("src/lib/product-schema.ts", "utf8");
const flagship = readFileSync(
  "src/components/sections/FlagshipProof.astro",
  "utf8",
);
const profile = readFileSync("src/pages/products/[slug].astro", "utf8");

test("screenshot is currently optional (C1c decision open)", () => {
  assert.match(schema, /screenshot:\s*productScreenshot\.optional\(\)/);
  assert.match(schema, /OPEN DECISION \(owner, #125 C1c/);
});

test("render paths tolerate a missing screenshot", () => {
  assert.match(flagship, /screenshot \? \(/);
  assert.match(profile, /screenshot\?\.src/);
  assert.match(profile, /screenshot \? \(/);
});

test("the artifact shape is strict when a screenshot IS provided", () => {
  assert.match(schema, /\/products\//);
  assert.match(schema, /alt:\s*z\.string\(\)\.min\(1\)\.max\(160\)/);
  assert.match(schema, /width:\s*z\.number\(\)\.int\(\)\.positive\(\)/);
});
