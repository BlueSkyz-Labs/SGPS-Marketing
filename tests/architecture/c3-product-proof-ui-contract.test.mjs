import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("Product-to-Proof UI and Evidence Peek components exist", () => {
  assert.ok(existsSync("src/components/integrity/ProductProofLink.astro"));
  assert.ok(existsSync("src/components/integrity/EvidencePeek.astro"));
});

test("flagship capability surfaces consume the canonical proof selector", () => {
  for (const path of [
    "src/components/product/FlagshipTheatre.astro",
    "src/components/sections/FlagshipProof.astro",
  ]) {
    const source = read(path);
    assert.match(source, /getProductProofLinks/);
    assert.match(source, /ProductProofLink/);
    assert.doesNotMatch(source, /productProofCapabilityKey|slugify/i);
  }
});

test("proof chrome is conditional and evidence depth remains progressive", () => {
  const proof = read("src/components/integrity/ProductProofLink.astro");
  const peek = read("src/components/integrity/EvidencePeek.astro");

  assert.match(proof, /links\.length/);
  assert.match(proof, /data-product-proof/);
  assert.match(proof, /EvidencePeek/);
  assert.match(peek, /<details/);
  assert.match(peek, /<summary/);
  assert.doesNotMatch(
    proof + "\n" + peek,
    /trust.?score|maturity.?score|verified badge/i,
  );
});
