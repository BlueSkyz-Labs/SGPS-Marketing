import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const css = readFileSync(join(root, "src", "styles", "global.css"), "utf8");
const rootBlock = css.match(/:root\s*\{([^}]*)\}/s)?.[1] ?? "";
const themeBlock = css.match(/@theme\s*\{([^}]*)\}/s)?.[1] ?? "";

// Canonical Brand Kit v4 palette (07_DESIGN_TOKENS/tokens.css).
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
  // Allow the authored palette + W3 dark-surface tones. Anything else that a
  // component author hard-codes is a brand-consistency defect.
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

function walkAstro(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkAstro(p));
    else if (ent.name.endsWith(".astro")) out.push(p);
  }
  return out;
}
