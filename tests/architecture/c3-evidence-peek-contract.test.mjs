import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const peek = readFileSync("src/components/integrity/EvidencePeek.astro", "utf8");
const proof = readFileSync("src/components/integrity/ProductProofLink.astro", "utf8");

test("Evidence Peek consumes canonical, capability-scoped proof; never owns truth", () => {
  assert.match(proof, /getProductProofLinks\(slug, capability, products, claims\)/);
  assert.match(proof, /<EvidencePeek links=\{links\}/);
  assert.match(peek, /import type \{ ProductProofLink \} from ["']@\/lib\/product-proof["']/);
  assert.match(peek, /links\.length > 0/);
  assert.match(peek, /<details/);
  assert.match(peek, /<TruthState state=\{link\.truthState\}/);
  assert.match(peek, /link\.boundary/);
  assert.match(peek, /links\[0\]\.passportHref\[lang\]/);
  for (const source of [peek, proof]) {
    assert.doesNotMatch(source, /\b(fetch|sendBeacon|XMLHttpRequest)\s*\(|localStorage|sessionStorage|<script\b/);
    assert.doesNotMatch(source, /\b(export\s+)?const\s+(CLAIMS|EVIDENCE|PRODUCTS|RELEASES)\b/);
  }
});

test("Evidence Peek preserves stable public affordance selectors and explicit state", () => {
  for (const snippet of [
    "data-product-proof={slug}",
    "data-product-proof-capability={capability}",
    "c3-product-proof__summary",
    "c3-product-proof__item",
    "c3-product-proof__passport",
  ]) assert.ok(peek.includes(snippet), `missing public disclosure contract: ${snippet}`);
  assert.doesNotMatch(peek, /trust-score|confidence-score|verified-badge|certified/i);
});
