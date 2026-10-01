import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");
const craft = read("src/styles/c3-craft.css");
const globalCss = read("src/styles/global.css");
const layout = read("src/layouts/BaseLayout.astro");
const footer = read("src/components/layout/Footer.astro");
const navigator = read("src/lib/navigator.ts");

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** The base `.header-glass` rule must be opaque (no glass token). */
export const baseHeaderIsOpaque = (css) => {
  const base = strip(css).match(/(?:^|\n)\.header-glass\s*\{([^}]*)\}/);
  return Boolean(base) && !/surface-primary-glass/.test(base[1]);
};

/** Unprefixed backdrop-filter must survive (the minifier drops it when a
 * `-webkit-` twin sits next to it, which left Chromium unblurred). */
export const hasPrefixedBackdrop = (css) =>
  /-webkit-backdrop-filter/.test(strip(css));

/** Any `animation:` shorthand using `infinite`. */
export const infiniteAnimations = (css) =>
  [...strip(css).matchAll(/animation:[^;]*\binfinite\b[^;]*;/g)].map(
    (m) => m[0],
  );

test("B-15: base header is opaque; the glass token is only used where blur applies", () => {
  assert.equal(baseHeaderIsOpaque(craft), true);
  assert.equal(hasPrefixedBackdrop(craft), false);
  assert.match(
    craft,
    /@media \(min-width: 768px\) and \(min-height: 560px\)[\s\S]*?@supports \(backdrop-filter: blur\(1px\)\)[\s\S]*?--surface-primary-glass[\s\S]*?backdrop-filter: blur\(12px\)/,
  );
});

test("B-15 negative proof: translucent base or prefixed-only blur is rejected", () => {
  assert.equal(
    baseHeaderIsOpaque(
      ".header-glass {\n background-color: var(--surface-primary-glass);\n}",
    ),
    false,
  );
  assert.equal(
    hasPrefixedBackdrop(".x { -webkit-backdrop-filter: blur(1px); }"),
    true,
  );
});

test("B-01: skip link text pairs with the inverse surface it sits on", () => {
  const rule = strip(globalCss).match(/\.skip-link\s*\{([^}]*)\}/)[1];
  assert.match(rule, /background:\s*var\(--surface-inverse\)/);
  assert.match(rule, /color:\s*var\(--surface-primary\)/);
  assert.doesNotMatch(rule, /color:\s*var\(--brand-porcelain\)/);
});

test("B-02/B-03: palette is centred, gutters on mobile, rings not clipped", () => {
  const dialog = strip(globalCss).match(/\.command-navigator\s*\{([^}]*)\}/)[1];
  assert.match(dialog, /margin:\s*12vh auto 0/);
  assert.match(dialog, /width:\s*min\(100% - 2rem, 34rem\)/);
  const list = strip(globalCss).match(
    /\.command-navigator__list\s*\{([^}]*)\}/,
  )[1];
  assert.match(list, /padding:\s*4px/);
  assert.match(
    globalCss,
    /\.command-navigator__list a \{[^}]*padding:\s*0\.5rem 0\.75rem/,
  );
});

test("B-16/B-18/B-19: current, pointer and pressed states are authored", () => {
  assert.match(
    craft,
    /header nav a\[aria-current="page"\][\s\S]*?font-weight:\s*700[\s\S]*?text-decoration:\s*underline/,
  );
  assert.match(
    craft,
    /header details nav a\[aria-current="page"\][^{]*\{[^}]*box-shadow/,
  );
  assert.match(globalCss, /button:not\(:disabled\)[^{]*\{\s*cursor:\s*pointer/);
  assert.match(
    craft,
    /@media \(prefers-reduced-motion: no-preference\)\s*\{[^{}]*header nav a:not\(\.lang-option\):active[\s\S]*?scale\(0\.98\)/,
  );
});

test("B-22: no infinite animation in global or reveal css; negative proof", () => {
  assert.deepEqual(infiniteAnimations(globalCss), []);
  // The decorative horizon drift is gone, not merely shortened: a long
  // one-shot animation would break the cinematic fidelity contract.
  assert.doesNotMatch(globalCss, /animation:\s*horizon-drift/);
  assert.deepEqual(infiniteAnimations(read("src/styles/reveal.css")), []);
  assert.equal(
    infiniteAnimations(".a { animation: drift 6s ease-in-out infinite; }")
      .length,
    1,
  );
});

test("C-06: no-JS fallback hides theme controls; language keeps its native popover", () => {
  assert.match(
    layout,
    /<noscript>\s*<style>[\s\S]*?\[data-theme-trigger\][\s\S]*?display:\s*none/,
  );
  // The switcher's <button popovertarget> works without JS; forcing the panel
  // open broke that contract (language-switching.spec "without JS").
  assert.doesNotMatch(
    layout,
    /\.lang-panel\s*\{[^}]*display:\s*block !important/,
  );
});

test("A-11: footer renders labelled groups from site data only", () => {
  assert.match(footer, /getFooterGroups/);
  assert.match(footer, /aria-labelledby=\{`footer-group-\$\{index\}`\}/);
  assert.doesNotMatch(footer, /<ul class="flex flex-wrap/);
});

test("B-24: zh palette aliases include 验证, 选集 and 公开档案 wording", () => {
  assert.match(navigator, /zh: \["核实", "核验", "验证"/);
  assert.match(navigator, /editions: \{[\s\S]*?zh: \["选集"/);
  assert.match(navigator, /dossier: \{[\s\S]*?zh: \["公开档案"/);
});
