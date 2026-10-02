import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * v7 W1 — hero flagship card contract (source level). Complements
 * tests/e2e/v7-hero.spec.ts.
 */
const read = (p) => readFileSync(p, "utf8");
const HERO = "src/components/sections/Hero.astro";
const CAPTURE = "src/components/product/FlagshipCapture.astro";
const REVEAL = "src/styles/reveal.css";

export function cardIssues(hero, capture, reveal, sail) {
  const issues = [];
  // v8 W2: the bordered flagship card is gone; the capture, caption row and
  // CTA sit directly in the hero stage, so there is no container-query card.
  if (/hero-flagship__card/.test(hero)) issues.push("bordered card is back");
  if (!/class="hero-flagship__cta/.test(hero))
    issues.push("CTA lacks the no-break class");
  if (/grid-template-columns:\s*9rem/.test(hero))
    issues.push("fixed 9rem capture column");
  if (
    !/\.hero-flagship\s+:global\(\.hero-flagship__cta\)\s*\{[^}]*overflow-wrap:\s*normal/.test(
      hero,
    )
  )
    issues.push("CTA may break inside a word");
  if (/\$\{revision\}|\{provenance\}/.test(capture))
    issues.push("revision rendered in caption");
  if (/scale:\s*1\.07|translate:\s*calc\(-50% \+ 4\.2%\)/.test(reveal))
    issues.push("sail overlay uses scale/translate offset");
  if (!/HANDOFF_VIEWBOX/.test(sail)) issues.push("no fitted hand-off viewBox");
  return issues;
}

const sail = () => read("src/components/motion/SailReveal.astro");

test("hero card stacks, CTA never breaks mid-word, no revision, sail box aligned", () => {
  assert.deepEqual(
    cardIssues(read(HERO), read(CAPTURE), read(REVEAL), sail()),
    [],
  );
});

test("negative proof: each regression is reported", () => {
  const h = read(HERO);
  const c = read(CAPTURE);
  const r = read(REVEAL);
  const s = sail();
  assert.ok(
    cardIssues(
      h.replace(/overflow-wrap:\s*normal/, "overflow-wrap: anywhere"),
      c,
      r,
      s,
    ).length,
  );
  assert.ok(
    cardIssues(h + '\n<div class="hero-flagship__card"></div>', c, r, s).length,
  );
  assert.ok(
    cardIssues(h + "\n.x{grid-template-columns: 9rem 1fr}", c, r, s).length,
  );
  assert.ok(cardIssues(h, c + "${revision}", r, s).length);
  assert.ok(cardIssues(h, c + "{provenance}", r, s).length);
  assert.ok(cardIssues(h, c, r + "\n.a{scale: 1.07;}", s).length);
});

test("capture stays a ratio-reserved srcset image and the H1 wording is untouched", () => {
  const hero = read(HERO);
  assert.match(hero, /smallSrc=\{/);
  assert.match(hero, /op-01-home-288\.webp/);
  assert.match(hero, /\bproposition\b/);
});
