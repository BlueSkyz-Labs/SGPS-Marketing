import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/**
 * Go-live polish: white text on a solid action fill must clear WCAG AA (4.5:1)
 * in every theme block. The dark `--action-primary` (#3b82f6) is a TEXT/outline
 * colour on dark surfaces (5.15:1 on ink) and only reaches 3.68:1 as a fill, so
 * solid fills use `--action-fill` / `--action-primary-hover` instead.
 */
const css = readFileSync("src/styles/global.css", "utf8");

function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function block(selectorStart) {
  const start = css.indexOf(selectorStart);
  assert.ok(start >= 0, `missing CSS block ${selectorStart}`);
  return css.slice(start, css.indexOf("}", start));
}
function token(source, name) {
  const m = source.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(m, `missing ${name}`);
  return m[1].toLowerCase();
}

// Resolve the three theme blocks that define the action tokens.
const rootBlock = css.slice(
  css.indexOf("--action-fill: #2564ff;"),
  css.indexOf("--action-fill: #2564ff;") + 120,
);
const darkAttr = block('[data-theme="dark"] {');
const darkMedia = block(':root:not([data-theme="light"]) {');

test("solid action fill and hover carry white text at >= 4.5:1 in every theme", () => {
  for (const [name, src] of [
    ["root", rootBlock],
    ["data-theme=dark", darkAttr],
    ["prefers-color-scheme dark", darkMedia],
  ]) {
    for (const t of ["--action-fill", "--action-primary-hover"]) {
      const value = token(src, t);
      assert.ok(
        ratio("#ffffff", value) >= 4.5,
        `${name} ${t} ${value} vs #fff = ${ratio("#ffffff", value).toFixed(2)}`,
      );
    }
  }
});

test("dark --action-primary stays a legible text colour on dark surfaces", () => {
  for (const src of [darkAttr, darkMedia]) {
    const text = token(src, "--action-primary");
    for (const surface of [token(src, "--surface-subtle"), "#0b1020"]) {
      assert.ok(ratio(text, surface) >= 4.5, `${text} on ${surface}`);
    }
    // Focus ring is non-text UI: >= 3:1 against the page surface.
    assert.ok(ratio(token(src, "--focus-ring"), "#0b1020") >= 3);
  }
});

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const FILL_AS_ACTION_PRIMARY =
  /bg-\[var\(--action-primary\)\]|background(?:-color)?:\s*var\(--action-primary\)/;

test("no component paints a solid fill with --action-primary", () => {
  const offenders = walk("src")
    .filter((f) => /\.(astro|css|ts)$/.test(f))
    .filter((f) => FILL_AS_ACTION_PRIMARY.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, []);
});

test("negative proof: the old #3b82f6 fill and an --action-primary fill are rejected", () => {
  assert.ok(ratio("#ffffff", "#3b82f6") < 4.5, "#3b82f6 must fail as a fill");
  assert.ok(ratio("#ffffff", "#2563eb") >= 4.5);
  assert.ok(
    FILL_AS_ACTION_PRIMARY.test(
      'class="bg-[var(--action-primary)] text-white"',
    ),
  );
});
