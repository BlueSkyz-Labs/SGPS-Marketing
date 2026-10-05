import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * Display type guard (Experience v6 S4, calm-chrome round 2026-10-04).
 *
 * Display headings use the already-loaded Inter Variable at a light display
 * weight: no second web face, zero added font bytes. The display token reaches
 * ONLY h1/h2 display headings (`.type-d1`, `.type-d2`, `.hero-headline`).
 * Each blocking check is a pure function, and the negative-proof test feeds it
 * a mutated input to show it turns RED.
 */
const CSS_PATH = "src/styles/display-type.css";
const FONT_DIR = "public/fonts";
const DISPLAY_SELECTORS = [".type-d1", ".type-d2", ".hero-headline"];
// Inter is instanced to wght 400-700; the quiet display band keeps headings
// light (Stripe-style lightness) without dropping below body emphasis.
const DISPLAY_WEIGHT_MIN = 480;
const DISPLAY_WEIGHT_MAX = 600;
// Only the brand text face ships; a display face would add bytes again.
const ALLOWED_FONT_FILE =
  /^inter-(latin|vietnamese)-wght-v\d+\.\d+\.\d+\.woff2$/;

const read = (path) => readFileSync(path, "utf8");
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Forward-slash paths so assertions are separator-independent. */
const toPosix = (path) => path.replaceAll("\\", "/");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** No display web face: the display token resolves to the loaded Inter face. */
function checkNoDisplayWebFace(css) {
  const code = stripComments(css);
  assert.doesNotMatch(code, /@font-face/, "display-type.css declares no faces");
  assert.doesNotMatch(code, /"Display Face"|plus-jakarta/i);
  const token = code.match(/--font-display\s*:\s*([^;]+);/)?.[1] ?? "";
  assert.match(
    token.trim(),
    /^"Inter Variable",\s*"Inter Fallback"/,
    "--font-display must start with the loaded Inter face and its metric fallback",
  );
}

/** Zero added font bytes: only the Inter text subsets are shipped. */
function checkFontFiles(names) {
  const woff2 = names.filter((n) => n.endsWith(".woff2"));
  assert.ok(woff2.length > 0, "Inter subsets must be present");
  for (const name of woff2) {
    assert.match(name, ALLOWED_FONT_FILE, `unexpected web font ${name}`);
  }
}

/** Display rules use the weight token, and the token sits in the quiet band. */
function checkDisplayWeight(css) {
  const code = stripComments(css);
  const value = Number(code.match(/--display-weight\s*:\s*(\d+)\s*;/)?.[1]);
  assert.ok(Number.isFinite(value), "--display-weight token is required");
  assert.ok(
    value >= DISPLAY_WEIGHT_MIN && value <= DISPLAY_WEIGHT_MAX,
    `--display-weight ${value} outside ${DISPLAY_WEIGHT_MIN}-${DISPLAY_WEIGHT_MAX}`,
  );
  const rule =
    code.match(
      /\.type-d1,\s*\.type-d2,\s*\.hero-headline\s*\{([^}]*)\}/,
    )?.[1] ?? "";
  assert.match(rule, /font-family\s*:\s*var\(--font-display\)/);
  assert.match(rule, /font-weight\s*:\s*var\(--display-weight\)/);
}

// Every rule that sets font-family: var(--font-display*) must be scoped to the
// display selectors only (never body, h3+, p, eyebrow, button...).
function checkDisplayScope(css) {
  const stripped = stripComments(css);
  const rules = [
    ...stripped.matchAll(/([^{}@]+)\{([^{}]*font-family\s*:[^{}]*)\}/g),
  ];
  assert.ok(rules.length > 0, "display rules not found");
  for (const [, selectorList, body] of rules) {
    if (!/var\(--font-display/.test(body)) continue;
    const flat = selectorList
      .replace(/:lang\([^)]*\)/g, " ")
      .replace(/:is\(|\)/g, " ");
    for (const selector of flat.split(/[\s,]+/).filter(Boolean)) {
      assert.ok(
        DISPLAY_SELECTORS.includes(selector),
        `display face leaked to "${selector}"`,
      );
    }
  }
}

function checkNoOtherUsage(files) {
  for (const [path, text] of files) {
    if (toPosix(path) === CSS_PATH) continue;
    assert.doesNotMatch(
      text,
      /--font-display|--display-weight|"Display Face"|plus-jakarta/,
      `${path} must not reference the display token directly`,
    );
  }
}

function checkHeadingOnly(files) {
  for (const [path, text] of files) {
    for (const tag of text.match(/<[a-zA-Z][\w-]*\b[^>]*>/g) ?? []) {
      if (!/\btype-d[12]\b/.test(tag)) continue;
      assert.match(tag, /^<h[12]\b/, `${path}: display class on ${tag}`);
    }
  }
}

function checkNoCulturalNames(css) {
  assert.doesNotMatch(
    stripComments(css),
    /son-mai|lacquer|chu-dau|dong-ho|maison/i,
  );
}

/** The engine-gated Inter preload stays; no display-face preload returns. */
function checkPreload(layoutSrc, bootstrap) {
  assert.doesNotMatch(
    layoutSrc,
    /\.woff2/,
    "font preloads live in theme-init.js (engine-aware), not in the HTML",
  );
  assert.match(bootstrap, /AppleWebKit/, "preload must stay engine-gated");
  assert.ok(
    bootstrap.includes("inter-${subset}-wght-v5.3.0"),
    "Inter preload must remain",
  );
  assert.doesNotMatch(bootstrap, /plus-jakarta|Display Face/);
}

const css = read(CSS_PATH);
const sources = walk("src")
  .filter((p) => /\.(astro|css|ts|mjs)$/.test(p))
  .map((p) => [p, read(p)]);
const templates = sources.filter(([p]) => p.endsWith(".astro"));
const fontNames = readdirSync(FONT_DIR);

test("display type uses the loaded Inter face, no second web face", () => {
  checkNoDisplayWebFace(css);
});

test("display headings add zero font bytes (only Inter subsets ship)", () => {
  checkFontFiles(fontNames);
});

test("display weight is a token inside the quiet band", () => {
  checkDisplayWeight(css);
});

test("display token is applied to h1/h2 display headings only", () => {
  checkDisplayScope(css);
  checkNoOtherUsage(sources);
  checkHeadingOnly(templates);
  checkNoCulturalNames(css);
});

// Windows regression pin: walk() yields OS-native separators, so the
// allowlisted stylesheet must still be skipped after normalization, and a
// non-allowlisted file that references the token must still fail.
test("display-token usage guard is separator-independent", () => {
  checkNoOtherUsage([
    ["src\\styles\\display-type.css", "a{font-family:var(--font-display)}"],
  ]);
  assert.throws(() =>
    checkNoOtherUsage([
      ["src\\styles\\other.css", "a{font-family:var(--font-display)}"],
    ]),
  );
});

test("Inter preload stays engine-gated and display type never reaches CJK", () => {
  checkPreload(
    read("src/layouts/BaseLayout.astro"),
    read("public/theme-init.js"),
  );
  const cjk = stripComments(css).match(/:lang\(zh\)[^{]*\{[^}]*\}/)?.[0] ?? "";
  assert.match(cjk, /font-family\s*:\s*var\(--font-display-cjk\)/);
  assert.match(cjk, /line-break\s*:\s*strict/);
  assert.doesNotMatch(cjk, /break-all/);
});

test("negative proof: each blocking check turns RED on a broken invariant", () => {
  const boot = read("public/theme-init.js");
  const layoutSrc = read("src/layouts/BaseLayout.astro");
  // Inter preload removed, a display-face preload re-added, or the engine gate dropped.
  assert.throws(() =>
    checkPreload(layoutSrc, boot.replaceAll("inter-${subset}", "x-${subset}")),
  );
  assert.throws(() =>
    checkPreload(
      layoutSrc,
      `${boot}\npreload("/fonts/plus-jakarta-sans-latin-700.woff2")`,
    ),
  );
  assert.throws(() =>
    checkPreload(layoutSrc, boot.replaceAll("AppleWebKit", "Gecko")),
  );
  // A second web face declared, or the token pointed away from Inter.
  assert.throws(() =>
    checkNoDisplayWebFace(
      `${css}\n@font-face{font-family:"Display Face";src:url(/fonts/plus-jakarta-sans-latin-700.woff2)}`,
    ),
  );
  assert.throws(() =>
    checkNoDisplayWebFace(
      css.replace('"Inter Variable", "Inter Fallback",', '"Other Face",'),
    ),
  );
  // An extra display font file shipped.
  assert.throws(() =>
    checkFontFiles([...fontNames, "plus-jakarta-sans-latin-700-v5.3.0.woff2"]),
  );
  // Heavy display weight, missing token, or a literal weight on the display rule.
  assert.throws(() =>
    checkDisplayWeight(
      css.replace(/--display-weight:\s*\d+;/, "--display-weight: 700;"),
    ),
  );
  assert.throws(() =>
    checkDisplayWeight(css.replace(/--display-weight:\s*\d+;/, "")),
  );
  assert.throws(() =>
    checkDisplayWeight(
      css.replace("font-weight: var(--display-weight);", "font-weight: 700;"),
    ),
  );
  // Display token leaking into body text.
  assert.throws(() =>
    checkDisplayScope(`${css}\nbody { font-family: var(--font-display); }`),
  );
  assert.throws(() =>
    checkDisplayScope(`${css}\nh3 { font-family: var(--font-display); }`),
  );
  // Another stylesheet or template using the token directly.
  assert.throws(() =>
    checkNoOtherUsage([
      ...sources,
      ["src/x.css", "p{font-weight:var(--display-weight)}"],
    ]),
  );
  // Display class on a paragraph.
  assert.throws(() =>
    checkHeadingOnly([["x.astro", '<p class="type-d2 mt-3">x</p>']]),
  );
  // Cultural token naming.
  assert.throws(() => checkNoCulturalNames(`${css}\n.son-mai-heading{}`));
});
