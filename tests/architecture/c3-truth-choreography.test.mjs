import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(
  "src/components/integrity/TruthState.astro",
  "utf8",
);
const css = readFileSync("src/styles/c3-craft.css", "utf8");
const combined = component + "\n" + css;

test("truth choreography is presentation-only and score-free", () => {
  assert.match(component, /data-truth-presentation/);
  assert.match(css, /data-truth-presentation/);
  assert.doesNotMatch(
    combined,
    /trust.?score|maturity.?score|confidence.?score|certified|verification badge/i,
  );
  assert.doesNotMatch(css, /@keyframes/);
});

test("visible text remains the semantic authority", () => {
  assert.match(component, /truth-state__label/);
  assert.match(component, /aria-label/);
});

test("non-essential truth transitions are neutralized for reduced motion", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.truth-state/);
  assert.match(css, /transition:\s*none/);
});
