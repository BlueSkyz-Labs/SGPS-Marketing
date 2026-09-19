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


test("saved theme bootstrap is same-origin, blocking, and read-only before first paint", () => {
  const layout = readFileSync(
    join(root, "src", "layouts", "BaseLayout.astro"),
    "utf8",
  );
  const bootstrap = readFileSync(join(root, "public", "theme-init.js"), "utf8");
  const theme = readFileSync(join(root, "src", "lib", "theme.ts"), "utf8");
  const headScript = '<script is:inline src="/theme-init.js"></script>';
  assert.ok(layout.includes(headScript), "blocking same-origin bootstrap must be in head");
  assert.ok(
    layout.indexOf(headScript) < layout.indexOf("</head>"),
    "theme bootstrap must execute before the body is parsed",
  );
  assert.match(bootstrap, /localStorage\.getItem\("blueskyz-theme"\)/);
  assert.doesNotMatch(bootstrap, /localStorage\.setItem|fetch\(|XMLHttpRequest/);
  assert.match(theme, /applyTheme\(mode, false\)/);
  assert.match(theme, /if \(persist\) \{/);
});
