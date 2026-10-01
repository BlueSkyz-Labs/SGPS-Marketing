import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync("src/styles/global.css", "utf8");
const container = readFileSync("src/components/layout/Container.astro", "utf8");
const hero = readFileSync("src/components/sections/Hero.astro", "utf8");
const header = readFileSync("src/components/layout/Header.astro", "utf8");

/** Returns literal container widths/gutters that bypass the shared contract. */
export function containerBypasses(source) {
  return [...source.matchAll(/max-w-7xl|max-w-\[1\d{3}px\]|\bpx-[45]\b/g)].map(
    (match) => match[0],
  );
}

test("shell and hero containers use the single site-container contract", () => {
  assert.match(css, /--site-max:\s*1320px/);
  assert.match(css, /\.site-container\s*\{[^}]*max-width:\s*var\(--site-max\)/);
  assert.match(container, /site-container/);
  assert.match(hero, /site-container/);
  assert.deepEqual(containerBypasses(container), []);
  assert.deepEqual(containerBypasses(hero), []);
  assert.match(
    css,
    /\.integrity-lens,[\s\S]*?max-width:\s*var\(--site-max\);[\s\S]*?padding:\s*2\.5rem var\(--site-gutter\)/,
  );
});

test("negative proof: a literal container width is detected", () => {
  assert.deepEqual(containerBypasses('class="mx-auto max-w-7xl px-4"'), [
    "max-w-7xl",
    "px-4",
  ]);
});

test("dark is composed: band token in every dark block and a distinct hero stage", () => {
  assert.equal((css.match(/--surface-band:\s*#0d1426/g) ?? []).length, 2);
  assert.match(css, /--surface-band:\s*var\(--brand-porcelain\)/);
  assert.match(css, /\[data-theme="dark"\] \.hero-plane--ink/);
  assert.match(css, /:root:not\(\[data-theme="light"\]\) \.hero-plane--ink/);
  // The hard vertical band on the ink atmosphere was a rendering artifact.
  const atmosphere =
    css.match(/\.hero-atmosphere--ink\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
  assert.ok(atmosphere.length > 0);
  assert.doesNotMatch(atmosphere, /linear-gradient\(\s*90deg/);
});

test("header: one Products CTA, About as the plain link, compact theme trigger", () => {
  // Owner decision 2026-10-01 (v7 A-12).
  assert.match(header, /const primaryCta = NAV\[0\]!;/);
  assert.match(header, /const primaryLink = NAV\[1\]!;/);
  assert.doesNotMatch(header, /emptyRegistryPrimaryCta/);
  assert.doesNotMatch(header, /exploreProducts/);
  assert.match(header, /variant="popover"/);
});
