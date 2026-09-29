/**
 * The responsive Prismatic hero mark (#317) must reserve its slot before the
 * <picture> source loads. Without a definite box the shrink-to-fit grid item
 * grows when the image arrives: Lighthouse measured CLS ≈ 0.112 on /en/ in
 * 3 of 5 desktop runs (budget 0.05).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const CSS = "src/styles/cinematic-product-house.css";

export function heroSlotReserved(css) {
  const picture = css.match(/\.hero-visual\s*>\s*picture\s*\{([^}]*)\}/)?.[1];
  if (!picture) return false;
  return (
    /display:\s*block/.test(picture) &&
    /width:\s*min\(100%,\s*30rem\)/.test(picture) &&
    /aspect-ratio:\s*1\b/.test(picture)
  );
}

test("the hero mark picture reserves a definite square slot", () => {
  assert.ok(heroSlotReserved(readFileSync(CSS, "utf8")));
});

test("negative proof: a shrink-to-fit picture is rejected", () => {
  const regressed = readFileSync(CSS, "utf8").replace(
    /\.hero-visual\s*>\s*picture\s*\{[^}]*\}/,
    "",
  );
  assert.equal(heroSlotReserved(regressed), false);
});
