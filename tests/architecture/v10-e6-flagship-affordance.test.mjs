import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const THEATRE = "src/components/product/FlagshipTheatre.astro";

/** The compact home heading link must show a decorative arrow (BB-02). */
export function checkTitleAffordance(src) {
  const link = src.match(/<a[^>]*data-flagship-title-link[\s\S]*?<\/a>/);
  assert.ok(link, "compact heading link carries data-flagship-title-link");
  const svg = link[0].match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(svg, "the heading link contains an arrow icon");
  assert.match(svg[0], /aria-hidden="true"/, "the arrow is decorative");
  assert.match(link[0], /\{data\.name\}/, "the name stays the link text");
  assert.match(
    src,
    /prefers-reduced-motion: reduce\)\s*\{\s*\.c2-flagship-theatre__title-arrow\s*\{\s*transition: none;/,
    "reduced motion removes the nudge",
  );
}

test("BB-02: the compact flagship heading shows a visible link affordance", () => {
  checkTitleAffordance(readFileSync(THEATRE, "utf8"));
});

test("negative proof: a heading link without the arrow is rejected", () => {
  const src = readFileSync(THEATRE, "utf8");
  const noArrow = src.replace(
    /(data-flagship-title-link[\s\S]*?)<svg[\s\S]*?<\/svg>/,
    "$1",
  );
  assert.throws(() => checkTitleAffordance(noArrow));
  const announced = src.replace(
    /class="c2-flagship-theatre__title-arrow"\s*aria-hidden="true"/,
    'class="c2-flagship-theatre__title-arrow"',
  );
  assert.throws(() => checkTitleAffordance(announced));
});
