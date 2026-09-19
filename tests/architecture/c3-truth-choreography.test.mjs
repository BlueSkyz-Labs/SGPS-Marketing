import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/c3-craft.css", "utf8");
const truth = readFileSync(
  "src/components/integrity/TruthState.astro",
  "utf8",
);

test("choreography uses existing text-bearing truth states", () => {
  for (const state of ["changed", "not-published", "unavailable"]) {
    assert.ok(
      css.includes(`data-truth-state="${state}"`),
      `missing patterned state: ${state}`,
    );
  }
  assert.match(truth, /data-truth-state=\{state\}/);
  assert.match(truth, /truth-state__label/);
  assert.match(truth, /aria-hidden="true"/);
  assert.doesNotMatch(
    css.slice(css.indexOf("C3-B Task 4")),
    /trust-score|maturity-score|confidence|certified|verified-badge/i,
  );
});

test("patterns honor reduced motion and forced colors", () => {
  const grammar = css.slice(css.indexOf("C3-B Task 4"));
  assert.match(grammar, /border-style:\s*dashed/);
  assert.match(grammar, /border-style:\s*dotted/);
  assert.match(grammar, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(grammar, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(grammar, /border-color:\s*CanvasText/);
  assert.doesNotMatch(
    grammar,
    /@keyframes|infinite|animation:\s*(?!none\b)[a-z-]+/,
  );
});
