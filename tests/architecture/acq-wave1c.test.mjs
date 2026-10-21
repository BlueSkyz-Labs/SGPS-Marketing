import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Wave 1c audit fixes (ACQ-01, ACQ-02, ACQ-12): source-level guards.
 * Each guard has a negative proof that breaks the invariant on a copy of the
 * source and shows the detector fails. Runtime proof is in
 * tests/e2e/acq-wave1c.spec.ts.
 */
const read = (path) => readFileSync(path, "utf8");

// ---- ACQ-01: the story screens hard-swap, never cross-fade ------------------

/** Widest scroll span (in % of the view range) over which opacity ramps. */
export function widestRamp(css) {
  const block = css.match(/@keyframes story-screen\s*\{([\s\S]*?)\n\}/);
  assert.ok(block, "@keyframes story-screen present");
  const stops = [];
  for (const m of block[1].matchAll(/([\d.,%\s]+)\{\s*opacity:\s*([^;]+);/g)) {
    for (const pct of m[1].split(",")) {
      const n = parseFloat(pct);
      if (!Number.isNaN(n)) stops.push({ at: n, value: m[2].trim() });
    }
  }
  stops.sort((a, b) => a.at - b.at);
  let widest = 0;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i].value !== stops[i - 1].value) {
      widest = Math.max(widest, stops[i].at - stops[i - 1].at);
    }
  }
  return widest;
}

test("ACQ-01: story-screen keyframes ramp over at most 0.1% (hard swap)", () => {
  const css = read("src/styles/reveal.css");
  assert.ok(widestRamp(css) <= 0.1, `ramp ${widestRamp(css)}%`);
});

test("ACQ-01 negative proof: the old 10% cross-fade ramp is flagged", () => {
  const old = `@keyframes story-screen {
  0%,
  22% {
    opacity: var(--story-in, 0);
  }
  32%,
  68% {
    opacity: 1;
  }
  78%,
  100% {
    opacity: var(--story-out, 0);
  }
}`;
  assert.equal(widestRamp(old), 10);
  assert.ok(widestRamp(old) > 0.1);
});

// ---- ACQ-02: task words reach the navigator index ---------------------------

test("ACQ-02: the navigator joins published jobs and capabilities per product", () => {
  const nav = read("src/lib/navigator.ts");
  const fn = nav.slice(nav.indexOf("export function buildProductSearchText"));
  assert.match(fn, /copy\.jobs/);
  assert.match(fn, /copy\.capabilities/);
  assert.match(fn, /productCopy\(product\.data, lang\)/);
  const component = read("src/components/experience/CommandNavigator.astro");
  assert.match(
    component,
    /buildProductSearchText\(lang, publicProducts\)/,
    "fed from public products only",
  );
});

test("ACQ-02 negative proof: dropping the feed or the strings is detected", () => {
  const component = read("src/components/experience/CommandNavigator.astro");
  const without = component.replace(
    /buildProductSearchText\(lang, publicProducts\)/,
    "[]",
  );
  assert.notEqual(without, component);
  assert.doesNotMatch(
    without,
    /buildProductSearchText\(lang, publicProducts\)/,
  );
  const nav = read("src/lib/navigator.ts");
  assert.doesNotMatch(nav.replace(/\.\.\.copy\.jobs,/, ""), /\.\.\.copy\.jobs/);
});

// ---- ACQ-12: header glyphs follow the root font size, items centred ---------

test("ACQ-12: .hc-glyph is rem-based and the header switcher is centred", () => {
  const css = read("src/components/layout/header-control.css");
  const glyph = css.match(/\n\.hc-glyph \{([\s\S]*?)\n\}/)[1];
  assert.match(glyph, /width:\s*calc\(20px \+ \(1rem - 16px\) \/ 2\)/);
  assert.match(glyph, /height:\s*calc\(20px \+ \(1rem - 16px\) \/ 2\)/);
  const sw = read("src/components/layout/LanguageSwitcher.astro");
  assert.match(sw, /\.lang-switch--header \{\s*align-self:\s*center;/);
});

test("ACQ-12 negative proof: a fixed 20px glyph is detected", () => {
  const css = read("src/components/layout/header-control.css");
  const broken = css.replace(/calc\(20px \+ \(1rem - 16px\) \/ 2\)/g, "20px");
  assert.notEqual(broken, css);
  assert.doesNotMatch(broken, /width:\s*calc\(20px \+ \(1rem - 16px\) \/ 2\)/);
});
