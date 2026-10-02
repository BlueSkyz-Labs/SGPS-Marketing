import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * Experience v6 S4 guard: the second (display) typeface is self-hosted, OFL,
 * subsetted, inside the byte budget, metric-matched, and reaches ONLY h1/h2
 * display headings (`.type-d1`, `.type-d2`, `.hero-headline`). Each blocking
 * check is a pure function, and the negative-proof test feeds it a mutated
 * input to show it turns RED.
 */
const CSS_PATH = "src/styles/display-type.css";
const FONT_DIR = "public/fonts";
const SUBSETS = ["latin", "latin-ext", "vietnamese"];
const FILE = (subset) => `plus-jakarta-sans-${subset}-700-v5.3.0.woff2`;
// Plan section 8 budget: 90 KB of added font bytes (all three subsets).
const ADDED_BYTES_BUDGET = 90_000;
// The two subsets a /vi/ or /en/ route actually requests.
const ROUTE_BYTES_BUDGET = 30_000;
const DISPLAY_SELECTORS = [".type-d1", ".type-d2", ".hero-headline"];

const read = (path) => readFileSync(path, "utf8");

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

function fontFaces(css) {
  return css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
}

function checkFontFaces(css) {
  const faces = fontFaces(css).filter((face) =>
    face.includes('"Display Face"'),
  );
  assert.equal(faces.length, SUBSETS.length, "one @font-face per subset");
  for (const subset of SUBSETS) {
    const face = faces.find((f) => f.includes(FILE(subset)));
    assert.ok(face, `${subset} subset must be declared`);
    assert.match(face, /font-display\s*:\s*swap/);
    assert.match(face, /unicode-range\s*:/);
    assert.match(face, /format\("woff2"\)/);
    assert.match(face, /font-weight\s*:\s*700\s*;/);
  }
  const fallback = fontFaces(css).find((f) => f.includes('"Display Fallback"'));
  assert.ok(fallback, "a metric-matched fallback face is required");
  for (const metric of [
    "size-adjust",
    "ascent-override",
    "descent-override",
    "line-gap-override",
  ]) {
    assert.match(fallback, new RegExp(`${metric}\\s*:`));
  }
}

function checkBytes(sizeOf) {
  const sizes = Object.fromEntries(SUBSETS.map((s) => [s, sizeOf(FILE(s))]));
  const total = Object.values(sizes).reduce((a, b) => a + b, 0);
  assert.ok(total <= ADDED_BYTES_BUDGET, `added fonts ${total} B over budget`);
  assert.ok(
    sizes.latin + sizes.vietnamese <= ROUTE_BYTES_BUDGET,
    "latin + vietnamese (the /vi/ route) over the per-route budget",
  );
}

function checkLicense(text) {
  assert.match(text, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(text, /Plus Jakarta Sans Project Authors/);
}

// Every rule that sets font-family: var(--font-display*) must be scoped to the
// display selectors only (never body, h3+, p, eyebrow, button...).
function checkDisplayScope(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
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
      /--font-display|"Display Face"|plus-jakarta/,
      `${path} must not reference the display face directly`,
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
    css.replace(/\/\*[\s\S]*?\*\//g, ""),
    /son-mai|lacquer|chu-dau|dong-ho|maison/i,
  );
}

const css = read(CSS_PATH);
const sources = walk("src")
  .filter((p) => /\.(astro|css|ts|mjs)$/.test(p))
  .map((p) => [p, read(p)]);
const templates = sources.filter(([p]) => p.endsWith(".astro"));

test("display face declares licensed, subsetted, swap-loaded faces with fallback metrics", () => {
  checkFontFaces(css);
});

test("display font bytes stay inside the plan budget", () => {
  checkBytes((name) => statSync(join(FONT_DIR, name)).size);
});

test("display face ships with its OFL licence", () => {
  checkLicense(read(join(FONT_DIR, "OFL-PlusJakartaSans.txt")));
  assert.match(read(join(FONT_DIR, "README.md")), /Plus Jakarta Sans/);
});

test("display face is applied to h1/h2 display headings only", () => {
  checkDisplayScope(css);
  checkNoOtherUsage(sources);
  checkHeadingOnly(templates);
  checkNoCulturalNames(css);
});

// Windows regression pin: walk() yields OS-native separators, so the
// allowlisted stylesheet must still be skipped after normalization, and a
// non-allowlisted file that references the face must still fail.
test("display-face usage guard is separator-independent", () => {
  checkNoOtherUsage([
    ["src\\styles\\display-type.css", "a{font-family:var(--font-display)}"],
  ]);
  assert.throws(() =>
    checkNoOtherUsage([
      ["src\\styles\\other.css", "a{font-family:var(--font-display)}"],
    ]),
  );
});

/** Display preload must exist, be engine-gated, and precede the Inter loop. */
function checkDisplayPreload(layoutSrc, bootstrap) {
  assert.doesNotMatch(
    layoutSrc,
    /plus-jakarta-sans/,
    "font preloads live in theme-init.js (engine-aware), not in the HTML",
  );
  assert.match(bootstrap, /AppleWebKit/, "preload must stay engine-gated");
  const display = bootstrap.indexOf("plus-jakarta-sans-${subset}-700-v5.3.0");
  const inter = bootstrap.indexOf("inter-${subset}-wght-v5.3.0");
  assert.ok(display > -1, "display face (LCP H1) must be preloaded");
  assert.ok(inter > -1, "Inter preload must remain");
  assert.ok(display < inter, "display preload must precede Inter");
}

test("display face is preloaded first (measured LCP evidence) and never reaches CJK", () => {
  checkDisplayPreload(
    read("src/layouts/BaseLayout.astro"),
    read("public/theme-init.js"),
  );
  const cjk =
    css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .match(/:lang\(zh\)[^{]*\{[^}]*\}/)?.[0] ?? "";
  assert.match(cjk, /font-family\s*:\s*var\(--font-display-cjk\)/);
  assert.match(cjk, /line-break\s*:\s*strict/);
  assert.doesNotMatch(cjk, /break-all/);
});

test("negative proof: each blocking check turns RED on a broken invariant", () => {
  // Display preload removed, or moved after Inter.
  const boot = read("public/theme-init.js");
  const layoutSrc = read("src/layouts/BaseLayout.astro");
  assert.throws(() =>
    checkDisplayPreload(layoutSrc, boot.replaceAll("plus-jakarta-sans-", "x-")),
  );
  const D = "plus-jakarta-sans-${subset}-700-v5.3.0";
  const I = "inter-${subset}-wght-v5.3.0";
  assert.throws(() =>
    checkDisplayPreload(
      layoutSrc,
      boot.replace(D, "@@").replace(I, D).replace("@@", I),
    ),
  );
  // Oversized font file.
  assert.throws(() => checkBytes(() => 60_000));
  // Missing font-display: swap.
  assert.throws(() =>
    checkFontFaces(
      css.replaceAll("font-display: swap;", "font-display: block;"),
    ),
  );
  // Dropped unicode-range subsetting.
  assert.throws(() =>
    checkFontFaces(css.replaceAll("unicode-range:", "data-range:")),
  );
  // Fallback metrics removed.
  assert.throws(() =>
    checkFontFaces(css.replaceAll("size-adjust", "x-adjust")),
  );
  // Licence missing / wrong.
  assert.throws(() => checkLicense("Copyright only"));
  // Display face leaking into body text.
  assert.throws(() =>
    checkDisplayScope(`${css}\nbody { font-family: var(--font-display); }`),
  );
  assert.throws(() =>
    checkDisplayScope(`${css}\nh3 { font-family: var(--font-display); }`),
  );
  // Another stylesheet or template using the face directly.
  assert.throws(() =>
    checkNoOtherUsage([
      ...sources,
      ["src/x.css", "p{font-family:var(--font-display)}"],
    ]),
  );
  // Display class on a paragraph.
  assert.throws(() =>
    checkHeadingOnly([["x.astro", '<p class="type-d2 mt-3">x</p>']]),
  );
  // Cultural token naming.
  assert.throws(() => checkNoCulturalNames(`${css}\n.son-mai-heading{}`));
});
