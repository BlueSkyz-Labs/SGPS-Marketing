import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const css = readFileSync(join(root, "src", "styles", "global.css"), "utf8");
const rootBlock = css.match(/:root\s*\{([^}]*)\}/s)?.[1] ?? "";
const themeBlock = css.match(/@theme\s*\{([^}]*)\}/s)?.[1] ?? "";

// Canonical Brand Kit v4 palette (07_DESIGN_TOKENS/tokens.json).
const PALETTE = {
  ink: "#0b1020",
  porcelain: "#f7f8fa",
  cobalt: "#2564ff",
  slate900: "#0f172a",
  slate700: "#334155",
  slate650: "#475569",
  slate300: "#cbd5e1",
  slate100: "#f1f5f9",
  actionDark: "#1d4ed8",
  white: "#ffffff",
};

// Real brand source values — tokens.json (v4.0.0).
const TOKENS = {
  radius: { sm: "8px", md: "12px", lg: "20px", pill: "999px" },
  shadow: { subtle: "0 8px 28px rgba(11,16,32,.12)" },
  semantic: { border: "#CBD5E1" },
  semanticDark: { border: "#334155" },
};

test("brand palette tokens exist and match the kit", () => {
  for (const [name, hex] of Object.entries(PALETTE)) {
    const re = new RegExp(
      `--(?:brand|color)-${name}\\s*:\\s*#${hex.slice(1)}`,
      "i",
    );
    for (const block of [rootBlock, themeBlock]) {
      if (new RegExp(`--(?:brand|color)-${name}\\b`).test(block)) {
        assert.match(block, re, `${name} token must equal kit ${hex}`);
      }
    }
  }
});

test("card radius stays on the canonical kit md (12px) scale", () => {
  assert.match(
    rootBlock,
    /--radius-card\s*:\s*(?:var\(--radius-md\)|0\.75rem)\b/,
    "radius-card must equal kit radius-md (12px)",
  );
  assert.match(
    css,
    /--radius-md\s*:\s*0\.75rem\b/,
    "radius-md token must be 12px",
  );
});

test("no off-palette hardcoded colors in card/badge surfaces (brand consistency)", () => {
  const allow = new Set([
    "#0b1020",
    "#f7f8fa",
    "#2564ff",
    "#0f172a",
    "#334155",
    "#475569",
    "#64748b",
    "#cbd5e1",
    "#f1f5f9",
    "#1d4ed8",
    "#ffffff",
    "#3b82f6",
    "#94a3b8",
    "#111827",
    "#1e293b",
  ]);
  const found = new Set();
  for (const f of walkAstro(join(root, "src", "components"))) {
    const s = readFileSync(f, "utf8");
    for (const m of s.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      const c = m[0].toLowerCase();
      if (!allow.has(c)) found.add(c);
    }
  }
  assert.ok(
    found.size === 0,
    `off-palette hex colors used in components: ${[...found].join(", ")}`,
  );
});

test("CSS root exposes the real Brand Kit v4 --bsl-* tokens (tokens.json)", () => {
  assert.match(
    rootBlock,
    /--bsl-radius-sm\s*:\s*8px/,
    "--bsl-radius-sm must be 8px per tokens.json",
  );
  assert.match(
    rootBlock,
    /--bsl-radius-md\s*:\s*12px/,
    "--bsl-radius-md must be 12px per tokens.json",
  );
  assert.match(
    rootBlock,
    /--bsl-radius-lg\s*:\s*20px/,
    "--bsl-radius-lg must be 20px per tokens.json",
  );
  assert.match(
    rootBlock,
    /--bsl-shadow-subtle\s*:\s*0\s*8px\s*28px\s*rgba\(11,\s*16,\s*32,\s*0\.12\)/,
    "--bsl-shadow-subtle must match tokens.json",
  );
  assert.match(
    rootBlock,
    /--bsl-border\s*:\s*#CBD5E1/i,
    `--bsl-border must be ${TOKENS.semantic.border} per tokens.json semantic.border`,
  );
});

test("Brand Kit v4 tokens.json has no radius.xl — --radius-xl must NOT exist in CSS", () => {
  assert.ok(
    !/--bsl-radius-xl|--radius-xl\s*:/.test(css),
    "--radius-xl must not exist: tokens.json defines no radius.xl (plan discrepancy: plan mentions 28px, source wins)",
  );
});

test("border-specular utility exists with specular top highlight", () => {
  assert.match(
    css,
    /\.border-specular\s*\{[^}]*border-top-color[^}]*\}/,
    ".border-specular must set a top highlight",
  );
  assert.match(
    css,
    /\.border-specular\s*\{[^}]*border\s*:\s*1px\s*solid\s*var\(--bsl-border\)/,
    ".border-specular must use --bsl-border",
  );
});

test("dark mode overrides --bsl-border to semanticDark.border (#334155)", () => {
  assert.match(
    css,
    /\[data-theme="dark"\][^}]*--bsl-border\s*:\s*#334155/,
    "dark mode --bsl-border must be #334155",
  );
  assert.match(
    css,
    /@media\s*\(prefers-color-scheme:\s*dark\)[^}]*--bsl-border\s*:\s*#334155/s,
    "prefers-color-scheme dark --bsl-border must be #334155",
  );
});

test("forced-colors mode degrades .border-specular gracefully", () => {
  assert.match(
    css,
    /@media\s*\(forced-colors:\s*active\)[^}]*\.border-specular/,
    "forced-colors media query must guard .border-specular",
  );
});

function walkAstro(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkAstro(p));
    else if (ent.name.endsWith(".astro")) out.push(p);
  }
  return out;
}
