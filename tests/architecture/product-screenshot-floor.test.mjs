/**
 * Proof media floor scaffold (owner decision #125 C1c, pending).
 * The frame is built; the mandate is not flipped. This test pins the CURRENT
 * contract — proof media optional, render paths media-tolerant, and the field
 * never named as a screenshot of running software — so the day the owner
 * supplies real /products/... captures, the flip is one line in
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

test("proof media is currently optional (C1c decision open)", () => {
  assert.match(schema, /media:\s*productMedia\.optional\(\)/);
  assert.match(schema, /OPEN DECISION \(owner, #125 C1c/);
  assert.doesNotMatch(
    schema,
    /screenshot\s*:/,
    "identity media must not be declared as a screenshot field",
  );
});

test("render paths tolerate a missing proof media", () => {
  assert.match(flagship, /media \? \(/);
  assert.match(profile, /media\?\.src/);
  assert.match(profile, /media \? \(/);
});

test("the artifact shape is strict when proof media IS provided", () => {
  assert.match(schema, /\/products\//);
  assert.match(schema, /alt:\s*z\.string\(\)\.min\(1\)\.max\(160\)/);
  assert.match(schema, /width:\s*z\.number\(\)\.int\(\)\.positive\(\)/);
});
