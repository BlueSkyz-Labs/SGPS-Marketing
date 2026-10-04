/**
 * Header control family guard (one visual family for search, language and
 * theme).
 *
 * The three header triggers, their popover panels and the choice rows inside
 * them are styled by ONE stylesheet, src/components/layout/header-control.css.
 * What must not regress:
 *   - every consumer imports the shared stylesheet and carries its classes;
 *   - no consumer re-declares the family's surface/geometry in its own
 *     <style> (that is how the two switchers drifted apart);
 *   - the palette is owned (`--hc-*`), declared for light, explicit dark,
 *     OS dark and the ink header scene, and never reads `--text-*`;
 *   - the panel uses the `--radius-panel` token and no blur material
 *     (ADR 0012: the header is the sole translucent surface);
 *   - triggers rest quietly (no edge/fill/shadow) and hover restores the
 *     accent edge;
 *   - triggers keep the 44px floor, rows the 3.5rem row, both the 3px focus
 *     ring, and motion stops under prefers-reduced-motion.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SHARED_PATH = "src/components/layout/header-control.css";
const SHARED = readFileSync(SHARED_PATH, "utf8");
const LANG = readFileSync(
  "src/components/layout/LanguageSwitcher.astro",
  "utf8",
);
const THEME = readFileSync("src/components/layout/ThemeToggle.astro", "utf8");
const HEADER = readFileSync("src/components/layout/Header.astro", "utf8");
const GLOBAL = readFileSync("src/styles/global.css", "utf8");

const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "");

export function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    strip(source).match(
      new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`),
    )?.[1] ?? null
  );
}

/** Every way the shared stylesheet stops defining one family. */
export function auditShared(css) {
  const problems = [];
  const trigger = rule(css, ".hc-trigger");
  if (
    !trigger ||
    !/min-width:\s*44px/.test(trigger) ||
    !/min-height:\s*44px/.test(trigger) ||
    !/padding:\s*0 0\.75rem/.test(trigger) ||
    !/gap:\s*0\.5rem/.test(trigger) ||
    !/border:\s*1px solid var\(--hc-line\)/.test(trigger) ||
    !/border-radius:\s*var\(--radius-md\)/.test(trigger) ||
    !/background:\s*var\(--hc-surface\)/.test(trigger) ||
    !/color:\s*var\(--hc-fg\)/.test(trigger) ||
    !/font-weight:\s*600/.test(trigger)
  ) {
    problems.push("the trigger must keep the shared 44px family geometry");
  }
  // Calm-chrome round: no edge/fill/shadow at rest; hover/open restore the edge.
  const quiet = rule(css, '.hc-trigger:not(:hover, [aria-expanded="true"])');
  if (
    !quiet ||
    !/border-color:\s*transparent/.test(quiet) ||
    !/background:\s*transparent/.test(quiet) ||
    !/box-shadow:\s*none/.test(quiet)
  ) {
    problems.push("the trigger must rest quietly (no edge, fill or shadow)");
  }
  const hover = strip(css).match(
    /\.hc-trigger:hover,\s*\.hc-trigger\[aria-expanded="true"\]\s*\{([^}]*)\}/,
  )?.[1];
  if (!hover || !/border-color:\s*var\(--hc-accent\)/.test(hover)) {
    problems.push("hover and the open state must restore the accent edge");
  }
  const focus = rule(css, ".hc-trigger:focus-visible");
  if (!focus || !/outline:\s*3px solid var\(--hc-accent\)/.test(focus)) {
    problems.push("the trigger must keep the 3px accent focus ring");
  }
  const panel = rule(css, ".hc-panel");
  if (
    !panel ||
    !/border-radius:\s*var\(--radius-panel\)/.test(panel) ||
    !/width:\s*min\(18rem, calc\(100vw - 1\.5rem\)\)/.test(panel) ||
    !/background:\s*var\(--hc-surface\)/.test(panel)
  ) {
    problems.push("the panel must be the solid 18rem --radius-panel card");
  }
  if (/backdrop-filter/.test(strip(css))) {
    problems.push("ADR 0012: no blur material on controls or panels");
  }
  const row = rule(css, ".hc-row");
  if (
    !row ||
    !/min-height:\s*3\.5rem/.test(row) ||
    !/border:\s*2px solid transparent/.test(row) ||
    !/grid-template-columns:\s*2\.25rem minmax\(0, 1fr\) 1\.5rem/.test(row) ||
    !/border-radius:\s*var\(--radius-md\)/.test(row)
  ) {
    problems.push("rows must keep the 3.5rem / 2px transparent border grid");
  }
  const current = strip(css).match(
    /\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{([^}]*)\}/,
  )?.[1];
  if (
    !current ||
    !/border-color:\s*var\(--hc-accent\)/.test(current) ||
    !/background:\s*var\(--hc-current-bg\)/.test(current)
  ) {
    problems.push("the current row must carry the accent border and tint");
  }
  const rowFocus = rule(css, ".hc-row:focus-visible");
  if (!rowFocus || !/outline:\s*3px solid var\(--hc-accent\)/.test(rowFocus)) {
    problems.push("rows must keep the 3px accent focus ring");
  }
  // Owned palette for every scene.
  if (
    !/\.hc-trigger,\s*\.hc-panel,\s*\.hc-group\s*\{[^}]*--hc-accent:\s*#1d4ed8/.test(
      css,
    )
  ) {
    problems.push("the light palette must be declared");
  }
  if (
    !/:root\[data-theme="dark"\] :is\(\.hc-trigger, \.hc-panel, \.hc-group\),\s*header\[data-scene="ink"\] :is\(\.hc-trigger, \.hc-group\),\s*\.hc-on-ink \.hc-trigger\s*\{[^}]*--hc-accent:\s*#3b82f6/.test(
      css,
    )
  ) {
    problems.push("explicit dark and the ink scene must use the dark palette");
  }
  if (
    !/prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\) :is\(\.hc-trigger, \.hc-panel, \.hc-group\)\s*\{[^}]*--hc-accent:\s*#3b82f6/.test(
      css,
    )
  ) {
    problems.push("OS dark must use the dark palette");
  }
  if (/var\(--text-(?:primary|secondary|muted)\)/.test(strip(css))) {
    problems.push("the family must never read the ambient --text-* tokens");
  }
  if (
    !/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.hc-trigger,\s*\.hc-chevron,\s*\.hc-panel,\s*\.hc-panel::backdrop,\s*\.hc-row\s*\{\s*transition:\s*none !important/.test(
      css,
    )
  ) {
    problems.push("motion must stop under prefers-reduced-motion");
  }
  if (!/@media \(forced-colors: active\)/.test(css)) {
    problems.push("forced colours must keep the control edges");
  }
  return problems;
}

/** Remove one at-rule block (balanced braces) from a stylesheet. */
export function withoutBlock(css, prelude) {
  const start = css.indexOf(prelude);
  if (start === -1) return css;
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") depth -= 1;
    if (depth === 0) return css.slice(0, start) + css.slice(i + 1);
  }
  return css;
}

/** Family properties a consumer may not re-declare in its own <style>. */
const FAMILY_PROPS =
  /\b(?:border|border-color|border-radius|background|background-color|box-shadow|min-height|padding|outline)\s*:/;

/** Consumers: shared import, shared classes, no local re-declaration. */
export function auditConsumers({ lang, theme, header }) {
  const problems = [];
  const importLine =
    /import "(?:\.\/|@\/components\/layout\/)header-control\.css";/;
  for (const [name, source] of [
    ["LanguageSwitcher", lang],
    ["ThemeToggle", theme],
    ["Header", header],
  ]) {
    if (!importLine.test(source)) {
      problems.push(`${name} must import the shared header-control.css`);
    }
  }
  if (!/isMenu \? "hc-row hc-row--disclosure" : "hc-trigger"/.test(lang)) {
    problems.push("the language trigger must use the shared trigger/row");
  }
  if (!/class="lang-panel hc-panel"/.test(lang)) {
    problems.push("the language panel must use the shared panel");
  }
  if (!/"lang-option hc-row"/.test(lang)) {
    problems.push("language rows must use the shared row");
  }
  if (!/class="theme-trigger hc-trigger hc-trigger--icon"/.test(theme)) {
    problems.push("the theme trigger must use the shared trigger");
  }
  if (!/"theme-group--panel theme-panel hc-panel"/.test(theme)) {
    problems.push("the theme panel must use the shared panel");
  }
  if (!/class="theme-row hc-row"/.test(theme)) {
    problems.push("theme rows must use the shared row");
  }
  if (
    !/data-command-trigger[\s\S]*?class="hc-trigger hc-trigger--icon"/.test(
      header,
    )
  ) {
    problems.push("the search trigger must use the shared trigger");
  }
  // Anti-drift: the family's surface/geometry lives only in the shared file.
  for (const [name, source, selectors] of [
    [
      "LanguageSwitcher",
      lang,
      [".lang-switch__trigger", ".lang-panel", ".lang-option"],
    ],
    ["ThemeToggle", theme, [".theme-trigger", ".theme-panel", ".theme-row"]],
  ]) {
    // The no-Popover-API fallback (lists rendered inline) is exempt: it is a
    // different layout, not a restyle of the family.
    const style = withoutBlock(
      source.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "",
      "@supports not selector(:popover-open)",
    );
    for (const selector of selectors) {
      const block = rule(style, selector);
      if (block && FAMILY_PROPS.test(block)) {
        problems.push(`${name} re-declares family styling on ${selector}`);
      }
    }
  }
  return problems;
}

test("the shared stylesheet defines one trigger/panel/row family", () => {
  assert.deepEqual(auditShared(SHARED), []);
});

test("search, language and theme all consume the shared family", () => {
  assert.deepEqual(
    auditConsumers({ lang: LANG, theme: THEME, header: HEADER }),
    [],
  );
});

test("the panel radius is a token, not a literal", () => {
  assert.match(GLOBAL, /--radius-panel:\s*1rem;/);
});

test("negative proof: a loud resting trigger or a lost hover edge is caught", () => {
  const loud = SHARED.replace(
    '.hc-trigger:not(:hover, [aria-expanded="true"]) {\n  border-color: transparent;',
    '.hc-trigger:not(:hover, [aria-expanded="true"]) {\n  border-color: var(--hc-line);',
  );
  assert.notEqual(loud, SHARED);
  assert.ok(auditShared(loud).some((p) => p.includes("rest quietly")));
  const noEdge = SHARED.replace(
    /(\.hc-trigger\[aria-expanded="true"\]\s*\{[^}]*?)border-color:\s*var\(--hc-accent\);/,
    "$1",
  );
  assert.notEqual(noEdge, SHARED);
  assert.ok(
    auditShared(noEdge).some((p) => p.includes("restore the accent edge")),
  );
});

test("negative proof: a component re-declaring trigger styling is caught", () => {
  const drifted = THEME.replace(
    "<style>",
    "<style>\n  .theme-trigger {\n    border-radius: var(--radius-card);\n  }\n",
  );
  assert.notEqual(drifted, THEME);
  assert.ok(
    auditConsumers({ lang: LANG, theme: drifted, header: HEADER }).some((p) =>
      p.includes("re-declares family styling on .theme-trigger"),
    ),
  );
  const langDrift = LANG.replace(
    "<style>",
    "<style>\n  .lang-option {\n    min-height: 3rem;\n  }\n",
  );
  assert.notEqual(langDrift, LANG);
  assert.ok(
    auditConsumers({ lang: langDrift, theme: THEME, header: HEADER }).some(
      (p) => p.includes("re-declares family styling on .lang-option"),
    ),
  );
});

test("negative proof: dropping the shared import or class is caught", () => {
  const noImport = HEADER.replace(
    'import "@/components/layout/header-control.css";',
    "",
  );
  assert.notEqual(noImport, HEADER);
  assert.ok(
    auditConsumers({ lang: LANG, theme: THEME, header: noImport }).some((p) =>
      p.includes("Header must import"),
    ),
  );
  const noClass = HEADER.replace(
    'class="hc-trigger hc-trigger--icon"',
    'class="rounded-lg border"',
  );
  assert.notEqual(noClass, HEADER);
  assert.ok(
    auditConsumers({ lang: LANG, theme: THEME, header: noClass }).some((p) =>
      p.includes("search trigger"),
    ),
  );
});

test("negative proof: losing the ink palette, a blur or a literal radius is caught", () => {
  const noInk = SHARED.replace(
    'header[data-scene="ink"] :is(.hc-trigger, .hc-group),',
    "",
  );
  assert.notEqual(noInk, SHARED);
  assert.ok(auditShared(noInk).some((p) => p.includes("ink scene")));
  const blur = SHARED.replace(
    "  box-shadow: var(--hc-shadow);\n  gap: 0.125rem;",
    "  box-shadow: var(--hc-shadow);\n  backdrop-filter: blur(12px);\n  gap: 0.125rem;",
  );
  assert.notEqual(blur, SHARED);
  assert.ok(auditShared(blur).some((p) => p.includes("ADR 0012")));
  const literal = SHARED.replace(
    "border-radius: var(--radius-panel);",
    "border-radius: 1rem;",
  );
  assert.notEqual(literal, SHARED);
  assert.ok(auditShared(literal).some((p) => p.includes("--radius-panel")));
});

test("negative proof: ambient tokens, a small trigger or lost motion guard are caught", () => {
  const ambient = SHARED.replace(
    /(\n\.hc-row \{[^}]*?)color:\s*var\(--hc-fg\);/,
    "$1color: var(--text-primary);",
  );
  assert.notEqual(ambient, SHARED);
  assert.ok(auditShared(ambient).some((p) => p.includes("--text-*")));
  const small = SHARED.replace(
    /(\n\.hc-trigger \{[^}]*?)min-height:\s*44px/,
    "$1min-height: 36px",
  );
  assert.notEqual(small, SHARED);
  assert.ok(auditShared(small).some((p) => p.includes("44px")));
  const motion = SHARED.replace(
    "transition: none !important;",
    "transition: all 1s;",
  );
  assert.notEqual(motion, SHARED);
  assert.ok(auditShared(motion).some((p) => p.includes("reduced-motion")));
});
