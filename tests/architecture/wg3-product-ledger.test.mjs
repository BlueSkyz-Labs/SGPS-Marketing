import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Wave G3-A guard: product surfaces speak the quiet-authority grammar.
 *
 * G-04  `.profile-does__tile` is a hairline row (no radius, shadow or raised
 *       background) with an aria-hidden derived index, in all four locales.
 * G-05  `.story__inspect` / `.showcase__inspect` take their voice from one
 *       shared `:where()` rule on C4 tokens; the component rules keep layout
 *       only (colour, size, weight, underline live in the shared rule).
 * G-06  `ProductCard` keeps its default raised card for ProductHouse; the
 *       opt-in `ledger` variant is a hairline row used only by the four
 *       products index pages.
 *
 * Source-level scan of declaration blocks; not a computed-style proof (the
 * e2e spec wg3-product-ledger.spec.ts covers rendered values).
 */
const ROOT = new URL("../../", import.meta.url).pathname;
const read = (rel) => readFileSync(`${ROOT}${rel}`, "utf8");
const LANGS = ["en", "vi", "zh", "zh-hant"];
const BOX = /border-radius|box-shadow|background|--surface-raised|--specular/;

/** Declaration bodies of every rule whose selector list matches `selector`. */
export function ruleBodies(css, selector) {
  const bodies = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(re)) {
    const selectors = m[1].split(",").map((s) => s.trim());
    if (selectors.some((s) => selector.test(s))) bodies.push(m[2]);
  }
  return bodies;
}

export function tileProblems(label, source) {
  const out = [];
  const bodies = ruleBodies(source, /^\.profile-does__tile$/);
  if (bodies.length === 0) out.push(`${label}: no .profile-does__tile rule`);
  for (const body of bodies) {
    if (BOX.test(body)) out.push(`${label}: tile carries a box style`);
  }
  const joined = bodies.join("\n");
  if (!/border-top:\s*1px solid var\(--c4-hairline\)/.test(joined))
    out.push(`${label}: tile lacks the C4 hairline top rule`);
  if (/border:\s|border-(left|right|bottom):/.test(joined))
    out.push(`${label}: tile carries a full or side border`);
  // EX-07 (wave E): no numerals in the list; story chapters carry "01 / 05".
  if (/profile-does__index/.test(source))
    out.push(`${label}: list carries a profile-does__index numeral`);
  if (/padStart\(\s*2\s*,\s*["']0["']\s*\)/.test(source))
    out.push(`${label}: list derives a two-digit numeral`);
  if (/<li class="profile-does__tile">\s*(?:<[^>]+>\s*)*0\d\b/.test(source))
    out.push(`${label}: a tile starts with a 0N numeral`);
  return out;
}

const INSPECT = /^\.(story|showcase)__inspect$/;

export function inspectProblems(css, story, showcase) {
  const out = [];
  const shared = css.match(
    /:where\(\.story__inspect,\s*\.showcase__inspect\)\s*\{([^{}]*)\}/,
  );
  if (!shared) return ["c4: shared :where() inspect rule missing"];
  const body = shared[1];
  if (!/font-size:\s*var\(--c4-type-meta\)/.test(body))
    out.push("c4: inspect size is not --c4-type-meta");
  if (!/color:\s*var\(--text-secondary\)/.test(body))
    out.push("c4: inspect colour is not --text-secondary");
  if (!/font-weight:\s*500/.test(body)) out.push("c4: inspect weight not 500");
  if (/--action-primary|--brand-cobalt/.test(body))
    out.push("c4: inspect rule uses a cobalt token");
  for (const [label, source] of [
    ["FeatureStory", story],
    ["ProductShowcase", showcase],
  ]) {
    for (const rule of ruleBodies(source, INSPECT)) {
      if (
        /(^|[\s;])(color|font-size|font-weight|text-decoration)\s*:/.test(rule)
      )
        out.push(`${label}: component rule re-declares the inspect voice`);
      if (!/min-height:\s*2\.75rem/.test(rule))
        out.push(`${label}: inspect lost its 2.75rem tap target`);
    }
  }
  return out;
}

export function cardProblems(card, house, indexPages) {
  const out = [];
  if (
    !/rounded-\[var\(--radius-card\)\] border border-\[var\(--border-hairline\)\] bg-\[var\(--surface-raised\)\]/.test(
      card,
    )
  )
    out.push("ProductCard: default raised card was removed");
  if (!/variant\s*=\s*"card"/.test(card))
    out.push('ProductCard: default variant is not "card"');
  const ledger = ruleBodies(card, /^\.product-card--ledger$/).join("\n");
  if (!ledger) out.push("ProductCard: no ledger rule");
  if (BOX.test(ledger)) out.push("ProductCard: ledger carries a box style");
  if (!/border-top:\s*1px solid var\(--c4-hairline\)/.test(ledger))
    out.push("ProductCard: ledger lacks the C4 hairline top rule");
  if (!/padding:\s*var\(--space-6\) 0/.test(ledger))
    out.push("ProductCard: ledger padding is not --space-6 0");
  if (/variant=/.test(house))
    out.push("ProductHouse: must not opt into a card variant");
  for (const [label, source] of Object.entries(indexPages)) {
    if (!/<ProductCard[^>]*variant="ledger"/s.test(source))
      out.push(`${label}: products index does not pass variant="ledger"`);
  }
  return out;
}

const sources = () => ({
  tiles: LANGS.map((l) => [l, read(`src/pages/${l}/products/[slug].astro`)]),
  css: read("src/styles/c4-quiet-authority.css"),
  story: read("src/components/product/FeatureStory.astro"),
  showcase: read("src/components/product/ProductShowcase.astro"),
  card: read("src/components/product/ProductCard.astro"),
  house: read("src/components/product/ProductHouse.astro"),
  index: Object.fromEntries(
    LANGS.map((l) => [l, read(`src/pages/${l}/products/index.astro`)]),
  ),
});

test("WG3-04: the feature list is a hairline list with no numerals, all locales", () => {
  for (const [lang, source] of sources().tiles) {
    assert.deepEqual(tileProblems(lang, source), []);
  }
});

test("WG3-04: the four locale pages carry identical list markup and rules", () => {
  const slice = (s) =>
    s.slice(
      s.indexOf("profile-does mt-4"),
      s.indexOf("</ul>", s.indexOf("profile-does mt-4")),
    ) + s.slice(s.indexOf("  .profile-does {"), s.indexOf("</style>"));
  const [first, ...rest] = sources().tiles.map(([, s]) => slice(s));
  for (const other of rest) assert.equal(other, first);
});

test("WG3-05: inspect links share one C4 meta-voice rule", () => {
  const s = sources();
  assert.deepEqual(inspectProblems(s.css, s.story, s.showcase), []);
});

test("WG3-06: default card stays; ledger is opt-in and index-only", () => {
  const s = sources();
  assert.deepEqual(cardProblems(s.card, s.house, s.index), []);
});

test("negative proof G-04: a tile with radius, shadow, background, lost hairline or a numeral FAILS", () => {
  const [, base] = sources().tiles[0];
  const withRule = (extra) =>
    base.replace(/(\.profile-does__tile \{[^}]*)\}/, `$1  ${extra}\n  }`);
  for (const extra of [
    "border-radius: 0.75rem;",
    "box-shadow: 0 1px 2px red;",
    "background: var(--surface-raised);",
  ]) {
    assert.ok(tileProblems("fixture", withRule(extra)).length > 0, extra);
  }
  assert.ok(
    tileProblems(
      "fixture",
      base.replace("border-top: 1px solid var(--c4-hairline);", ""),
    ).length > 0,
  );
  const withIndex = base.replace(
    '<li class="profile-does__tile">',
    '<li class="profile-does__tile"><span class="profile-does__index">01</span>',
  );
  assert.ok(tileProblems("fixture", withIndex).length > 0, "index span");
  assert.ok(
    tileProblems(
      "fixture",
      base.replace(
        '<li class="profile-does__tile">',
        '<li class="profile-does__tile">01 ',
      ),
    ).length > 0,
    "leading 0N",
  );
  assert.ok(
    tileProblems(
      "fixture",
      base.replace("{item}", '{String(1).padStart(2, "0")}{item}'),
    ).length > 0,
    "padStart",
  );
});

test("negative proof G-05: cobalt colour, lost 500 weight or a component re-declaration FAILS", () => {
  const s = sources();
  assert.ok(
    inspectProblems(
      s.css.replace(
        /(:where\(\.story__inspect, \.showcase__inspect\) \{\s*)color: var\(--text-secondary\);/,
        "$1color: var(--action-primary);",
      ),
      s.story,
      s.showcase,
    ).length > 0,
  );
  assert.ok(
    inspectProblems(
      s.css.replace("font-weight: 500;", "font-weight: 600;"),
      s.story,
      s.showcase,
    ).length > 0,
  );
  assert.ok(
    inspectProblems(
      s.css,
      s.story.replace(
        /\.story__inspect \{/,
        ".story__inspect {\n    color: var(--action-primary);",
      ),
      s.showcase,
    ).length > 0,
  );
  assert.ok(
    inspectProblems(
      s.css,
      s.story,
      s.showcase.replace(/min-height: 2\.75rem;/, ""),
    ).length > 0,
  );
});

test("negative proof G-06: a boxed ledger, a lost default card or a ProductHouse opt-in FAILS", () => {
  const s = sources();
  assert.ok(
    cardProblems(
      s.card.replace(
        /(\.product-card--ledger \{)/,
        "$1\n    border-radius: 1rem;\n    box-shadow: 0 1px 2px red;",
      ),
      s.house,
      s.index,
    ).length > 0,
  );
  assert.ok(
    cardProblems(
      s.card.replace("bg-[var(--surface-raised)]", ""),
      s.house,
      s.index,
    ).length > 0,
  );
  assert.ok(
    cardProblems(
      s.card,
      s.house.replace(
        "<ProductCard product={hero}",
        '<ProductCard variant="ledger" product={hero}',
      ),
      s.index,
    ).length > 0,
  );
  assert.ok(
    cardProblems(s.card, s.house, {
      ...s.index,
      vi: s.index.vi.replace('variant="ledger"', ""),
    }).length > 0,
  );
});
