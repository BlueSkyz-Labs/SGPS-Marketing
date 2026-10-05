/**
 * UI upgrade WP-A — shell, tokens, rhythm and transitions.
 *
 * Pins the shared shell decisions other surfaces consume:
 *   F16 the two dark declarations (explicit `data-theme="dark"` and the no-JS
 *       OS-dark media rule) can never drift apart;
 *   F1  dark product-house bands bleed full width via border-image outset;
 *   F2  the footer is its own plane in dark;
 *   F8  one section spacing scale; F13 one eyebrow tracking token;
 *   F15 every radius token resolves to the kit scale (+ the header panel);
 *   F7  the locale strip aligns to the site grid;
 *   W4  the route transition sweep only runs when motion is welcome.
 * Every guard carries a negative proof that breaks the invariant.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import postcss from "postcss";

const read = (path) => readFileSync(path, "utf8");
const CSS = read("src/styles/global.css");

const DARK = '[data-theme="dark"]';
const OS_DARK = ':root:not([data-theme="light"])';

const declsOf = (rule) =>
  rule.nodes
    .filter((node) => node.type === "decl")
    .map((decl) => `${decl.prop}:${decl.value.replace(/\s+/g, " ").trim()}`);

const norm = (selector) => selector.replace(/\s+/g, " ").trim();

/**
 * Returns every drift between explicit dark rules and their OS-dark twins:
 * each `[data-theme="dark"] X` rule needs a `:root:not([data-theme="light"]) X`
 * rule inside `@media (prefers-color-scheme: dark)` with the same declarations
 * (and the reverse).
 */
function darkDrift(source) {
  const rootNode = postcss.parse(source);
  const explicit = new Map();
  const media = new Map();
  rootNode.walkRules((rule) => {
    const inOsDark =
      rule.parent?.type === "atrule" &&
      rule.parent.name === "media" &&
      /prefers-color-scheme:\s*dark/.test(rule.parent.params);
    for (const raw of rule.selectors) {
      const selector = norm(raw);
      if (!inOsDark && selector.startsWith(DARK)) {
        explicit.set(selector.slice(DARK.length).trim(), declsOf(rule));
      } else if (inOsDark && selector.startsWith(OS_DARK)) {
        media.set(selector.slice(OS_DARK.length).trim(), declsOf(rule));
      }
    }
  });
  const drift = [];
  for (const [key, decls] of explicit) {
    const twin = media.get(key);
    if (!twin) drift.push(`missing OS-dark twin for "${DARK} ${key}"`);
    else if (JSON.stringify(twin) !== JSON.stringify(decls))
      drift.push(`declarations differ for "${key || ":root"}"`);
  }
  for (const key of media.keys()) {
    if (!explicit.has(key)) drift.push(`missing explicit twin for "${key}"`);
  }
  return { drift, explicit, media };
}

test("F16: explicit dark and OS-dark declarations are identical", () => {
  const { drift, explicit } = darkDrift(CSS);
  assert.ok(explicit.has(""), "the dark token block must exist");
  assert.ok(explicit.size >= 5, "expected the paired dark rules");
  assert.deepEqual(drift, []);
});

test("F16 negative proof: a token changed in one block only is caught", () => {
  const broken = CSS.replace(
    /(\[data-theme="dark"\]\s*\{[^}]*--surface-band:\s*)#0d1426/,
    "$1#101a30",
  );
  assert.notEqual(broken, CSS);
  assert.ok(
    darkDrift(broken).drift.some((d) => d.includes(":root")),
    "a one-sided token change must be reported",
  );
  const missing = CSS.replace(
    /\n {2}:root:not\(\[data-theme="light"\]\) \.c2-product-house \+ \.c2-product-house \{[^}]*\}/,
    "",
  );
  assert.notEqual(missing, CSS);
  assert.ok(darkDrift(missing).drift.some((d) => d.startsWith("missing")));
});

const bandRule = (source, prefix) => {
  const rootNode = postcss.parse(source);
  let found = null;
  rootNode.walkRules((rule) => {
    if (rule.selectors.map(norm).includes(`${prefix} .c2-product-house`))
      found = Object.fromEntries(
        declsOf(rule).map((d) => [
          d.slice(0, d.indexOf(":")),
          d.slice(d.indexOf(":") + 1),
        ]),
      );
  });
  return found;
};
const bandIsFullBleed = (decls) =>
  Boolean(decls) &&
  !("background" in decls) &&
  /var\(--surface-band\).*fill.*\/\s*0\s+100vmax/.test(
    decls["border-image"] ?? "",
  );

test("F1: dark product-house bands bleed full width without a container-bound background", () => {
  for (const prefix of [DARK, OS_DARK]) {
    assert.ok(bandIsFullBleed(bandRule(CSS, prefix)), prefix);
  }
  assert.match(
    CSS,
    /\[data-theme="dark"\] \.c2-product-house \+ \.c2-product-house \{\s*border-image-source: none;/,
    "adjacent product-house sections must alternate",
  );
});

test("F1 negative proof: a container-bound background band is caught", () => {
  const broken = CSS.replace(
    /(\[data-theme="dark"\] \.c2-product-house \{)/,
    "$1\n  background: var(--surface-band);",
  );
  assert.notEqual(broken, CSS);
  assert.equal(bandIsFullBleed(bandRule(broken, DARK)), false);
});

const hex = (h) =>
  [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16) / 255);
const lum = (rgb) =>
  rgb
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

test("F2: the footer is its own plane in dark and keeps porcelain text legible", () => {
  const { explicit } = darkDrift(CSS);
  const tokens = Object.fromEntries(
    explicit
      .get("")
      .map((d) => [d.slice(0, d.indexOf(":")), d.slice(d.indexOf(":") + 1)]),
  );
  const footer = tokens["--surface-footer"];
  assert.match(footer ?? "", /^#[0-9a-f]{6}$/i);
  assert.notEqual(
    footer,
    "#0b1020",
    "dark footer must differ from the ink page",
  );
  assert.ok(contrast("#f7f8fa", footer) >= 7, "porcelain on footer >= 7:1");
  assert.match(tokens["--footer-edge"] ?? "", /^#[0-9a-f]{6}$/i);
  assert.match(
    CSS,
    /\.site-footer \{\s*background-color: var\(--surface-footer\);\s*border-top: 1px solid var\(--footer-edge\);/,
  );
  assert.match(
    read("src/components/layout/Footer.astro"),
    /class="site-footer /,
  );
});

test("F8/F13: one section spacing scale and one eyebrow tracking token", () => {
  assert.match(CSS, /:root \{[\s\S]*?--section-y: 4rem;/);
  assert.match(
    CSS,
    /@media \(min-width: 1024px\) \{\s*:root \{[^}]*--section-y: 6rem;/,
  );
  const tracking = (scope) =>
    Number(
      CSS.match(
        new RegExp(`${scope} \\{\\s*--tracking-eyebrow: ([0-9.]+)em;`),
      )?.[1],
    );
  assert.equal(tracking(":lang\\(en\\)"), 0.12);
  assert.ok(tracking(":lang\\(vi\\)") < 0.12, "Vietnamese tracks tighter");
  assert.ok(tracking(":lang\\(zh\\)") < tracking(":lang\\(vi\\)"));
  for (const path of [
    "src/components/layout/Footer.astro",
    "src/components/experience/JourneyBar.astro",
  ]) {
    assert.doesNotMatch(
      read(path),
      /tracking-\[0\.18em\]|tracking-wide\b/,
      path,
    );
  }
});

/** px value of every radius token declared directly on :root. */
function radiusTokens(source) {
  const rootBlock = source.match(/\n:root \{([\s\S]*?)\n\}/)[1];
  const raw = Object.fromEntries(
    [...rootBlock.matchAll(/(--(?:bsl-)?radius-[a-z-]+):\s*([^;]+);/g)].map(
      (m) => [m[1], m[2].trim()],
    ),
  );
  const px = (value) => {
    const alias = value.match(/^var\((--[a-z-]+)\)$/);
    if (alias) return px(raw[alias[1]]);
    const n = parseFloat(value);
    return value.endsWith("rem") ? n * 16 : n;
  };
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, px(v)]));
}
const KIT_RADII = new Set([8, 12, 20, 999]);
const offScale = (tokens) =>
  Object.entries(tokens).filter(
    ([name, value]) =>
      !KIT_RADII.has(value) && !(name === "--radius-panel" && value === 16),
  );

test("F15: every radius token resolves to the kit scale (8/12/20/pill, panel 16)", () => {
  const tokens = radiusTokens(CSS);
  assert.ok(Object.keys(tokens).length >= 8);
  assert.deepEqual(offScale(tokens), []);
});

test("F15 negative proof: an off-scale radius token is caught", () => {
  const broken = CSS.replace("--radius-sm: 0.5rem;", "--radius-sm: 10px;");
  assert.notEqual(broken, CSS);
  assert.deepEqual(
    offScale(radiusTokens(broken)).map(([n]) => n),
    ["--radius-sm"],
  );
});

const gridAligned = (src) =>
  /padding-inline:\s*max\(\s*var\(--site-gutter[^)]*\),\s*calc\(\(100% - var\(--site-max[^)]*\)\) \/ 2 \+ var\(--site-gutter/.test(
    src,
  );

test("F7: the locale strip aligns its content to the site grid", () => {
  assert.ok(gridAligned(read("src/components/layout/LocaleSuggestion.astro")));
  assert.equal(gridAligned("padding: 0.5rem 1rem;"), false);
});

test("W4: the room sweep only runs when motion is welcome; no client router", () => {
  const welcome = CSS.match(
    /@media \(prefers-reduced-motion: no-preference\) \{\s*::view-transition-new\(root\) \{[\s\S]*?\n\}/,
  );
  assert.ok(welcome, "the sweep lives behind no-preference");
  assert.match(welcome[0], /mask-image:/);
  const outside = CSS.replace(welcome[0], "");
  assert.doesNotMatch(
    outside,
    /::view-transition-new\(root\)\s*\{[^}]*mask-image/,
    "a mask outside the motion guard would hide content under reduced motion",
  );
  assert.doesNotMatch(read("src/layouts/BaseLayout.astro"), /ClientRouter/);
});
