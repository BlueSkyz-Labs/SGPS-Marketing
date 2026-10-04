import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * F9: one arrow system. Copy strings never carry an arrow glyph; the CTA
 * component renders the BlueSkyzIcon arrow. ButtonLink uses the global
 * `--focus-ring` outline (no second cobalt ring), animates box-shadow, keeps
 * every derived colour behind `@supports`, and moves the arrow only when the
 * visitor allows motion.
 */
const read = (p) => readFileSync(p, "utf8");
const BUTTON = read("src/components/ui/ButtonLink.astro");
const SAFE = read("src/components/integrity/SafeAction.astro");
const CSS = read("src/styles/global.css");
const COPY_FILES = ["src/data/site.ts", "src/data/empty-state-copy.ts"];

const ARROW_GLYPHS = /[←-⇿⟵-⟿➔➜➡›»]/;

/** Arrow glyphs found inside string literals (comments are ignored). */
function glyphsInStrings(source) {
  const hits = [];
  for (const m of source.matchAll(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) {
    if (ARROW_GLYPHS.test(m[2])) hits.push(m[2]);
  }
  return hits;
}

function styleBlock(source) {
  const m = source.match(/<style>([\s\S]*?)<\/style>/);
  assert.ok(m, "ButtonLink must keep its scoped <style>");
  return m[1];
}

/** Top-level CSS chunks outside any @supports block. */
function outsideSupports(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf("@supports", i);
    if (at < 0) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, at);
    let depth = 0;
    let j = css.indexOf("{", at);
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}" && --depth === 0) break;
    }
    i = j + 1;
  }
  return out;
}

/** Rules inside `@media (prefers-reduced-motion: no-preference)` blocks. */
function insideNoPreference(css) {
  let out = "";
  const re = /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/g;
  for (const m of css.matchAll(re)) {
    let depth = 1;
    let j = m.index + m[0].length;
    const start = j;
    for (; j < css.length && depth > 0; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
    }
    out += css.slice(start, j - 1);
  }
  return out;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function focusRings() {
  return [...CSS.matchAll(/--focus-ring:\s*(#[0-9a-fA-F]{6})/g)].map((m) =>
    m[1].toLowerCase(),
  );
}

test("copy strings carry no arrow glyph; the component renders the arrow", () => {
  for (const f of COPY_FILES) {
    assert.deepEqual(glyphsInStrings(read(f)), [], f);
  }
});

test("negative proof: the copy-glyph check rejects the old strings", () => {
  assert.equal(glyphsInStrings('en: "Check our claims →",').length, 1);
  assert.equal(glyphsInStrings('vi: "Xem các tuyên bố và nguồn →",').length, 1);
  assert.equal(glyphsInStrings("// a → b comment\nx = 1;").length, 0);
});

test("SafeAction renders the shared ButtonLink, never a text arrow", () => {
  assert.match(
    SAFE,
    /import ButtonLink from "@\/components\/ui\/ButtonLink\.astro"/,
  );
  assert.match(SAFE, /<ButtonLink\b/);
  assert.doesNotMatch(SAFE, />\s*[→›»]\s*</);
  assert.match(BUTTON, /<BlueSkyzIcon\b/);
  assert.match(BUTTON, /btn__icon--\$\{trailingIcon\}/);
});

test("negative proof: the old SafeAction glyph span is rejected", () => {
  assert.match('<span aria-hidden="true">→</span>', />\s*[→›»]\s*</);
});

const OLD_FOCUS =
  /ring-\[var\(--brand-cobalt\)\]|focus-visible:outline-none|outline:\s*none/;

test("ButtonLink focus is the global --focus-ring outline, with a halo", () => {
  const css = styleBlock(BUTTON);
  assert.doesNotMatch(BUTTON, OLD_FOCUS);
  assert.match(css, /--btn-ring:\s*var\(--focus-ring,/);
  assert.match(
    css,
    /\.btn:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--btn-ring\)[^}]*outline-offset:\s*3px/,
  );
  assert.match(
    css,
    /\.btn:focus-visible\s*\{[^}]*box-shadow:\s*0 0 0 3px var\(--btn-halo\)/,
  );
  assert.match(css, /transition-property:[^;]*box-shadow/);
});

test("negative proof: the old cobalt ring class string is rejected", () => {
  assert.match(
    "focus-visible:ring-2 focus-visible:ring-[var(--brand-cobalt)] focus-visible:outline-none",
    OLD_FOCUS,
  );
});

test("focus indicator clears 3:1 on porcelain and ink in every theme", () => {
  const rings = focusRings();
  assert.ok(rings.length >= 3, "focus ring in root + both dark blocks");
  const [light, ...dark] = rings;
  // Light theme: the ring on a porcelain page, and the porcelain halo on an
  // ink band (hero/header), each clear 3:1.
  assert.ok(ratio(light, "#f7f8fa") >= 3, `light ring on porcelain`);
  assert.ok(ratio("#f7f8fa", "#0b1020") >= 3, "porcelain halo on ink");
  for (const d of dark) assert.ok(ratio(d, "#0b1020") >= 3, `dark ring ${d}`);
  // on-ink variant: porcelain ring over an ink halo.
  assert.match(
    styleBlock(BUTTON),
    /\.btn--on-ink\s*\{[^}]*--btn-ring:\s*var\(--brand-porcelain/,
  );
});

test("negative proof: the light ring alone on ink fails, so the halo is required", () => {
  assert.ok(ratio("#1d4ed8", "#0b1020") < 3);
});

test("static state colours carry white text at >= 4.5:1", () => {
  for (const fill of ["#2564ff", "#1d4ed8"]) {
    assert.ok(ratio("#ffffff", fill) >= 4.5, fill);
  }
  const css = styleBlock(BUTTON);
  assert.match(
    css,
    /\.btn--primary\s*\{[^}]*--btn-bg:\s*var\(--action-fill, #2564ff\)/,
  );
  assert.match(
    css,
    /\.btn--primary:hover\s*\{[^}]*--btn-bg:\s*var\(--action-primary-hover, #1d4ed8\)/,
  );
  assert.match(
    css,
    /\.btn--primary:active\s*\{[^}]*--btn-bg:\s*var\(--action-primary-hover, #1d4ed8\)/,
  );
  // Secondary stays an outline: never a raised surface fill.
  assert.doesNotMatch(css, /\.btn--secondary[^{]*\{[^}]*--surface-raised/);
});

test("every color-mix() sits behind @supports with a static value first", () => {
  assert.doesNotMatch(outsideSupports(styleBlock(BUTTON)), /color-mix\(/);
  assert.match(
    styleBlock(BUTTON),
    /@supports \(color: color-mix\(in oklab, red, blue\)\)/,
  );
});

test("negative proof: a bare color-mix() outside @supports is rejected", () => {
  assert.match(
    outsideSupports(".a{--b:color-mix(in srgb,red,blue)}@supports (x:y){.c{}}"),
    /color-mix\(/,
  );
});

const MOTION = /translate|scale\(/;

test("arrow and press motion run only under prefers-reduced-motion: no-preference", () => {
  const css = styleBlock(BUTTON);
  const outside = css.replace(insideNoPreference(css), "");
  assert.doesNotMatch(outside, MOTION);
  assert.match(
    insideNoPreference(css),
    /btn__icon--arrow-right\)\s*\{\s*transform:\s*translateX/,
  );
});

test("negative proof: motion outside the no-preference block is rejected", () => {
  const css = ".btn:hover .btn__icon{transform:translateX(3px)}";
  assert.match(css.replace(insideNoPreference(css), ""), MOTION);
});

test("disabled state: no href, aria-disabled, styled", () => {
  assert.match(BUTTON, /href=\{disabled \? undefined : href\}/);
  assert.match(BUTTON, /aria-disabled=\{disabled \? "true" : undefined\}/);
  assert.match(styleBlock(BUTTON), /\.btn\[aria-disabled="true"\]\s*\{/);
});
