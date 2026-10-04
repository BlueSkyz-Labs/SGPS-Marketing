import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// v8 W6: one grid, one scale, one family. Source contracts with negative proofs.

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "");
const cssFiles = walk("src", [".css"]);
const styled = walk("src", [".css", ".astro"]);

/** Literal font sizes that bypass the nine-step scale. */
export function strayFontSizes(text) {
  return [...strip(text).matchAll(/font-size:\s*([^;}]+)[;}]/g)]
    .map((m) => m[1].trim())
    .filter(
      (v) =>
        !/^(var\(--(?:size-[1-9]|c4-type-[a-z]+|type-[a-z0-9-]+)\)|inherit|initial|unset|[0-9.]+em|[0-9.]+%|smaller|larger|medium)$/.test(
          v,
        ),
    );
}
/** Literal radii outside the radius tokens and the small control allowlist. */
export function strayRadii(text) {
  return [...strip(text).matchAll(/border-radius:\s*([^;}]+)[;}]/g)]
    .map((m) => m[1].trim())
    .filter(
      (v) =>
        !/^(0|50%|0\.25rem|0\.5rem|4px|inherit|var\(--[a-z0-9-]+(?:,[^)]*)?\)(?: var\(--[a-z0-9-]+\))*|calc\(var\([^)]*\) - [0-9.a-z]+\)|var\(--radius-media\) var\(--radius-media\) 0 0)$/.test(
          v,
        ),
    );
}
/** An outline pill (rounded-full border) that contains an inline dot. */
export function dotPills(text) {
  return [
    ...text.matchAll(
      /<(?:a|span|button)\b[^>]*class="[^"]*(?:rounded-full[^"]*\bborder\b|\bborder\b[^"]*rounded-full)[^"]*"[^>]*>\s*<span\b[^>]*class="[^"]*\bsize-1\.5\b[^"]*"/g,
    ),
  ].map((m) => m[0]);
}
/** Container widths: every max-width must come from the container tokens. */
export function strayChMeasures(text) {
  return [...strip(text).matchAll(/max-width:\s*([0-9.]+ch)/g)].map(
    (m) => m[1],
  );
}

test("font sizes come only from the nine-step scale", () => {
  const stray = cssFiles.flatMap((f) =>
    strayFontSizes(readFileSync(f, "utf8")).map((v) => `${f}: ${v}`),
  );
  const astro = walk("src", [".astro"]).flatMap((f) =>
    strayFontSizes(readFileSync(f, "utf8")).map((v) => `${f}: ${v}`),
  );
  assert.deepEqual([...stray, ...astro], []);
  const css = readFileSync("src/styles/global.css", "utf8");
  for (const [i, v] of [
    "0.75",
    "0.875",
    "1",
    "1.125",
    "1.25",
    "1.5",
    "2",
    "2.75",
    "4",
  ].entries()) {
    assert.match(
      css,
      new RegExp(`--size-${i + 1}:\\s*${v.replace(".", "\\.")}rem`),
    );
  }
});

test("negative proof: a stray font size is detected", () => {
  assert.deepEqual(strayFontSizes(".x{font-size: 0.9375rem;}"), ["0.9375rem"]);
  assert.deepEqual(strayFontSizes(".x{font-size: clamp(1rem, 2vw, 2rem);}"), [
    "clamp(1rem, 2vw, 2rem)",
  ]);
  assert.deepEqual(strayFontSizes(".x{font-size: var(--size-3);}"), []);
});

test("radii use the three radius tokens or the small control allowlist", () => {
  const stray = styled.flatMap((f) =>
    strayRadii(readFileSync(f, "utf8")).map((v) => `${f}: ${v}`),
  );
  assert.deepEqual(stray, []);
  const css = readFileSync("src/styles/global.css", "utf8");
  assert.match(css, /--radius-card:\s*0\.75rem/);
  assert.match(css, /--radius-media:\s*20px/);
  assert.match(css, /--radius-pill:\s*999px/);
  assert.match(css, /--radius-panel:\s*1rem/);
});

test("negative proof: a stray radius is detected", () => {
  assert.deepEqual(strayRadii(".x{border-radius: 13px;}"), ["13px"]);
  assert.deepEqual(strayRadii(".x{border-radius: 999px;}"), ["999px"]);
  assert.deepEqual(strayRadii(".x{border-radius: var(--radius-pill);}"), []);
  // The header-control popover radius is the --radius-panel token; the literal
  // and its neighbours stay stray.
  assert.deepEqual(strayRadii(".x{border-radius: 1rem;}"), ["1rem"]);
  assert.deepEqual(strayRadii(".x{border-radius: 1.1rem;}"), ["1.1rem"]);
  assert.deepEqual(strayRadii(".x{border-radius: var(--radius-panel);}"), []);
});

test("no outline pill carries an inline dot", () => {
  const hits = walk("src", [".astro"]).flatMap((f) =>
    dotPills(readFileSync(f, "utf8")).map((h) => `${f}: ${h.slice(0, 60)}`),
  );
  assert.deepEqual(hits, []);
});

test("negative proof: an outline pill with a dot is detected", () => {
  const bad =
    '<a class="inline-flex rounded-full border px-3"><span aria-hidden="true" class="size-1.5 rounded-full bg-current" />Go</a>';
  assert.equal(dotPills(bad).length, 1);
  assert.equal(
    dotPills('<a class="rounded-full border px-3">Go</a>').length,
    0,
  );
});

test("the container set is exactly {reading, wide}", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  assert.match(css, /--container-reading:\s*45rem/);
  assert.match(css, /--container-wide:\s*78\.5rem/);
  assert.match(css, /--site-max:\s*var\(--container-wide\)/);
  assert.match(
    css,
    /\.site-container--reading\s*\{[^}]*max-width:\s*var\(--container-reading\)/,
  );
  const strays = cssFiles.flatMap((f) =>
    strayChMeasures(readFileSync(f, "utf8")).map((v) => `${f}: ${v}`),
  );
  assert.deepEqual(strays, []);
  const container = readFileSync(
    "src/components/layout/Container.astro",
    "utf8",
  );
  assert.match(container, /"wide" \| "reading"/);
});

test("negative proof: a stray ch measure is detected", () => {
  assert.deepEqual(strayChMeasures(".x{max-width: 62ch;}"), ["62ch"]);
  assert.deepEqual(
    strayChMeasures(".x{max-width: var(--container-reading);}"),
    [],
  );
});

test("buttons: secondary has no dot, :active and pointer cursor are defined", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  assert.match(css, /\.btn-secondary:active\s*\{[^}]*scale\(0\.98\)/);
  assert.match(
    css,
    /prefers-reduced-motion:\s*no-preference\)\s*\{\s*\.btn-secondary:active/,
  );
  assert.match(css, /button:not\(:disabled\)[^{]*\{\s*cursor:\s*pointer/);
  const link = readFileSync("src/components/ui/ButtonLink.astro", "utf8");
  assert.doesNotMatch(
    link,
    /variant === "secondary" &&\s*"[^"]*bg-\[var\(--surface-raised\)\]/,
  );
  const registry = readFileSync("src/lib/icon-registry.ts", "utf8");
  assert.doesNotMatch(
    registry,
    /M18 14v5H5V6h5/,
    "square external chip retired",
  );
});

test("header material follows ADR 0012 (blur branch): alpha >= 0.86, solid fallback", () => {
  const g = readFileSync("src/styles/global.css", "utf8");
  const c = readFileSync("src/styles/c3-craft.css", "utf8");
  const alphas = [
    ...(g + c).matchAll(
      /--surface-primary-glass:\s*rgba\([^)]*,\s*([0-9.]+)\)/g,
    ),
  ].map((m) => Number(m[1]));
  assert.ok(alphas.length >= 3);
  for (const a of alphas) assert.ok(a >= 0.86, `glass alpha ${a}`);
  assert.match(
    c,
    /@supports \(backdrop-filter: blur\(1px\)\)[\s\S]*?backdrop-filter:\s*blur\(12px\)/,
  );
  assert.match(
    c,
    /\.header-glass\s*\{\s*[^}]*background-color:\s*var\(--surface-primary\)/,
  );
});

test("dark surfaces, CJK stacks, balance/pretty and print rules exist", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  for (const n of [1, 2, 3]) assert.match(css, new RegExp(`--surface-${n}:`));
  assert.match(css, /\[data-theme="dark"\] \{[^}]*--surface-1:\s*#0b1020/);
  assert.match(
    css,
    /:lang\(zh-Hans\)\s*\{[^}]*PingFang SC[^}]*Noto Sans SC[^}]*Microsoft YaHei/,
  );
  assert.match(
    css,
    /:lang\(zh-Hant\)\s*\{[^}]*PingFang TC[^}]*Noto Sans TC[^}]*Microsoft JhengHei/,
  );
  assert.match(css, /word-break:\s*keep-all;\s*line-break:\s*strict/);
  assert.match(css, /text-wrap:\s*balance/);
  assert.match(css, /text-wrap:\s*pretty/);
  assert.match(
    css,
    /@media print \{\s*\.hero-plane,[\s\S]*?color:\s*#000 !important/,
  );
});

test("back to top is a plain anchor with no script", () => {
  const c = readFileSync("src/components/layout/BackToTop.astro", "utf8");
  assert.match(c, /href="#top"/);
  assert.doesNotMatch(c, /<script/);
  assert.match(
    readFileSync("src/layouts/BaseLayout.astro", "utf8"),
    /<body id="top"/,
  );
});

// The link sits outside <main> so it never inflates page word or action caps
// (v8-trust-pages, exp-s8 contact), inside its own nav landmark for axe.
function backToTopInsideMain(layout) {
  const main = layout.slice(layout.indexOf("<main"), layout.indexOf("</main>"));
  return main.includes("<BackToTop");
}

test("back to top renders outside <main>", () => {
  const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
  assert.equal(backToTopInsideMain(layout), false);
  assert.match(
    readFileSync("src/components/layout/BackToTop.astro", "utf8"),
    /<nav class="back-to-top-nav" aria-label=/,
  );
});

test("negative proof: back to top inside <main> is caught", () => {
  const broken = '<main id="m">\n<BackToTop lang="en" />\n</main>';
  assert.equal(backToTopInsideMain(broken), true);
});
