import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const css = readFileSync(join(root, "src", "styles", "global.css"), "utf8");

// Extract the [data-theme="dark"] {} block.
const darkMatch = css.match(/\[data-theme="dark"\]\s*\{([^}]*)\}/s);
assert.ok(darkMatch, `[data-theme="dark"] block must exist in global.css`);
const darkBlock = darkMatch[1];

const REQUIRED_DARK_TOKENS = [
  "color-scheme: dark",
  "--surface-primary",
  "--surface-subtle",
  "--surface-inverse",
  "--surface-raised",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--border-subtle",
  "--action-primary",
  "--focus-ring",
];

test("dark theme overrides every light-specific surface/text token", () => {
  for (const token of REQUIRED_DARK_TOKENS) {
    assert.ok(
      darkBlock.includes(token),
      `dark block must override \`${token}\``,
    );
  }
  // No light values may leak into the dark block. surface-inverse MAY be
  // porcelain (it is the light inverted surface); surface-primary/muted must flip.
  assert.ok(
    !darkBlock.includes("--surface-primary: var(--brand-porcelain)") &&
      !darkBlock.includes("--surface-primary: #f7f8fa"),
    "surface-primary must not stay porcelain in dark",
  );
  assert.ok(
    !/--text-muted:\s*#475569/.test(darkBlock),
    "text-muted must not stay light slate-650 in dark",
  );
  assert.ok(
    !darkBlock.includes("color-scheme: light"),
    "color-scheme must be dark inside [data-theme='dark']",
  );
});

test("dark theme is contrast-safe", () => {
  const pairs = [
    ["#ffffff", "var(--brand-ink)", "text-primary on surface-primary"], // ink = #0b1020
    ["#cbd5e1", "var(--brand-ink)", "text-secondary on surface-primary"],
    ["#94a3b8", "var(--brand-ink)", "text-muted on surface-primary"],
  ];
  for (const [fg, bg, label] of pairs) {
    const hex = bg.includes("--brand-ink") ? "#0b1020" : bg;
    const ratio = contrast(hexToRgb(fg), hexToRgb(hex));
    assert.ok(
      ratio >= 4.5,
      `${label}: contrast ${ratio.toFixed(2)}:1 must be >= 4.5:1 (WCAG AA)`,
    );
  }
});

test("default (no-JS) is coherent; dark via attr OR OS media, light pinnable", () => {
  assert.match(
    css,
    /:root\s*\{[^}]*color-scheme:\s*light/m,
    ":root default must be 'color-scheme: light'",
  );
  assert.match(
    css,
    /\[data-theme="light"\]\s*\{[^}]*color-scheme:\s*light/s,
    "explicit light override must force light",
  );
  assert.ok(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[^}]*:root:not\(\[data-theme="light"\]\)\s*\{[^}]*--surface-primary:/s.test(
      css,
    ),
    "OS-dark media rule must apply dark tokens when not pinned light",
  );
});

const hexToRgb = (h) => {
  const n = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
};
const lum = ([r, g, b]) => {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const L1 = lum(a);
  const L2 = lum(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};

test("saved theme bootstrap is blocking and read-only", () => {
  const layout = readFileSync(
    join(root, "src", "layouts", "BaseLayout.astro"),
    "utf8",
  );
  const bootstrap = readFileSync(join(root, "public", "theme-init.js"), "utf8");
  const theme = readFileSync(join(root, "src", "lib", "theme.ts"), "utf8");
  const headScript = '<script is:inline src="/theme-init.js"></script>';
  assert.ok(
    layout.includes(headScript),
    "blocking same-origin bootstrap must be in head",
  );
  assert.ok(
    layout.indexOf(headScript) < layout.indexOf("</head>"),
    "theme bootstrap must execute before the body is parsed",
  );
  assert.match(bootstrap, /localStorage\.getItem\("blueskyz-theme"\)/);
  assert.doesNotMatch(
    bootstrap,
    /localStorage\.setItem|fetch\(|XMLHttpRequest/,
  );
  assert.match(theme, /applyTheme\(mode, false\)/);
  assert.match(theme, /if \(persist\) \{/);
});

/**
 * F-21 source guard (2026-09-29). The header mounts LanguageSwitcher with the
 * "light" shell. Its active label used `--surface-raised` (theme aware) with the
 * fixed `--brand-ink` token, so dark mode rendered rgb(11,16,32) on
 * rgb(15,23,42) = 1.06:1. Labels in that shell must therefore use theme-aware
 * text tokens, and the shell itself must flip to a dark cavity in both dark
 * configurations. The e2e guard in tests/e2e/os-dark-contrast.spec.ts measures
 * the rendered pixels; this guard keeps the source from regressing silently.
 */
const SWITCHER = join(
  root,
  "src",
  "components",
  "layout",
  "LanguageSwitcher.astro",
);

function declarationColor(source, selector) {
  const index = source.indexOf(selector);
  if (index < 0) return null;
  const block = source.slice(index, source.indexOf("}", index));
  return block.match(/color:\s*([^;]+);/)?.[1]?.trim() ?? null;
}

export function fixedInkLabelOffenders(source) {
  const offenders = [];
  for (const selector of [
    ".lang-toggle-shell--light .lang-toggle-item--active",
    ".lang-toggle-shell--light .lang-toggle-item--idle",
  ]) {
    const color = declarationColor(source, selector);
    if (!color || !/var\(--text-(?:primary|muted)\)/.test(color)) {
      offenders.push(`${selector}: ${color ?? "missing color"}`);
    }
  }
  return offenders;
}

test("language switcher labels use theme-aware text tokens, never fixed ink", () => {
  const switcher = readFileSync(SWITCHER, "utf8");
  assert.deepEqual(fixedInkLabelOffenders(switcher), []);
  assert.match(
    switcher,
    /:global\(\[data-theme="dark"\]\) \.lang-toggle-shell--light/,
    "explicit dark theme must keep a dark switcher cavity",
  );
  assert.match(
    switcher,
    /prefers-color-scheme: dark\)[\s\S]*?:global\(:root:not\(\[data-theme="light"\]\)\) \.lang-toggle-shell--light/,
    "OS dark (without a pinned theme) must keep a dark switcher cavity",
  );
  // Accessible name must contain the visible code (WCAG 2.5.3 label in name).
  assert.match(switcher, /aria-label=\{`\$\{CODE\[lang\]\}/);
});

test("RED: the fixed-ink regression is detected", () => {
  const switcher = readFileSync(SWITCHER, "utf8");
  const mutated = switcher.replace(
    "color: var(--text-primary);",
    "color: var(--brand-ink, #0b1020);",
  );
  assert.notEqual(mutated, switcher, "mutation must apply");
  assert.deepEqual(fixedInkLabelOffenders(mutated), [
    ".lang-toggle-shell--light .lang-toggle-item--active: var(--brand-ink, #0b1020)",
  ]);
});
