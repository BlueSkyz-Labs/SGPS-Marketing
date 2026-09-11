import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/styles/global.css", "utf8");

const PURPOSE_DURATION_TOKENS = [
  "--motion-orientation-duration",
  "--motion-emphasis-duration",
  "--motion-confirmation-duration",
  "--motion-continuity-duration",
];

const PURPOSE_DISTANCE_TOKENS = [
  "--motion-distance-sm",
  "--motion-distance-md",
  "--motion-distance-lg",
];

test("S+ purpose-based motion tokens are defined", () => {
  for (const token of [
    ...PURPOSE_DURATION_TOKENS,
    ...PURPOSE_DISTANCE_TOKENS,
    "--motion-ease-standard",
  ]) {
    assert.match(
      css,
      new RegExp(`${token}:\\s*[^;]+;`),
      `${token} must be defined in global.css`,
    );
  }
});

test("purpose durations consume the base motion scale or explicit time", () => {
  for (const token of PURPOSE_DURATION_TOKENS) {
    const match = css.match(new RegExp(`${token}:\\s*([^;]+);`));
    assert.ok(match, `${token} must be defined`);
    const value = match[1].trim();
    assert.match(
      value,
      /^(var\(--motion-(fast|normal|slow)\)|\d+(\.\d+)?m?s)$/,
      `${token} must reference the base scale or an explicit duration (got "${value}")`,
    );
  }
});

test("reduced motion zeroes purpose-based durations and distances", () => {
  const reduceIndex = css.indexOf("@media (prefers-reduced-motion: reduce)");
  assert.ok(reduceIndex >= 0, "reduce media query must exist");
  const reduceSection = css.slice(reduceIndex);

  for (const token of PURPOSE_DURATION_TOKENS) {
    assert.match(
      reduceSection,
      new RegExp(`${token}:\\s*0m?s;`),
      `${token} must resolve to 0ms under prefers-reduced-motion: reduce`,
    );
  }
  for (const token of PURPOSE_DISTANCE_TOKENS) {
    assert.match(
      reduceSection,
      new RegExp(`${token}:\\s*0px;`),
      `${token} must resolve to 0px under prefers-reduced-motion: reduce`,
    );
  }
});
