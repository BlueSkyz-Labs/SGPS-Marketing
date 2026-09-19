import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/c3-craft.css", "utf8");
const truthPath = "src/components/integrity/TruthState.astro";
const truth = readFileSync(truthPath, "utf8");

test("choreography uses existing text-bearing truth states", () => {
  for (const state of ["changed", "not-published", "unavailable"]) {
    const selector = `data-truth-state="${state}"`;
    assert.ok(css.includes(selector), `missing patterned state: ${state}`);
  }
  assert.match(truth, /data-truth-state=\{state\}/);
  assert.match(truth, /truth-state__label/);
  assert.match(truth, /aria-hidden="true"/);
  const grammar = css.slice(css.indexOf("C3-B Task 4"));
  const forbidden = /trust-score|maturity-score|confidence|certified|badge/i;
  assert.doesNotMatch(grammar, forbidden);
});

test("patterns honor reduced motion and forced colors", () => {
  const grammar = css.slice(css.indexOf("C3-B Task 4"));
  assert.match(grammar, /border-style:\s*dashed/);
  assert.match(grammar, /border-style:\s*dotted/);
  assert.match(grammar, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(grammar, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(grammar, /border-color:\s*CanvasText/);
  const animated = /@keyframes|infinite|animation:\s*(?!none\b)[a-z-]+/;
  assert.doesNotMatch(grammar, animated);
});
