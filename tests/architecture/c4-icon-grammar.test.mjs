import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  ICON_GRAMMAR,
  ICON_REGISTRY,
  iconNames,
} from "../../src/lib/icon-registry.ts";

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(astro|ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
};

const files = walk("src");

test("C4 icons: the set stays a bounded allowlist", () => {
  const names = iconNames();
  assert.ok(names.length > 0, "registry must not be empty");
  assert.ok(
    names.length <= 8,
    `registry must stay bounded (got ${names.length})`,
  );
});

test("C4 icons: every path uses valid SVG path grammar", () => {
  const VALID = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+-]+$/;
  for (const [name, icon] of Object.entries(ICON_REGISTRY)) {
    assert.ok(icon.paths.length >= 1, `${name} must have at least one path`);
    for (const d of icon.paths) {
      assert.match(d, VALID, `${name} path "${d}" contains invalid characters`);
      assert.match(
        d,
        /^[Mm]/,
        `${name} path "${d}" must start with a move command`,
      );
    }
  }
});

test("C4 icons: one stroke grammar, no per-icon overrides", () => {
  assert.equal(ICON_GRAMMAR.viewBox, "0 0 24 24");
  assert.equal(ICON_GRAMMAR.fill, "none");
  assert.equal(ICON_GRAMMAR.strokeLinecap, "round");
  assert.equal(ICON_GRAMMAR.strokeLinejoin, "round");
  assert.equal(typeof ICON_GRAMMAR.strokeWidth, "number");
});

test("C4 icons: no ad-hoc 24-grid icon collection outside the registry", () => {
  const offenders = files.filter((f) => {
    if (f.endsWith("icon-registry.ts") || f.endsWith("BlueSkyzIcon.astro"))
      return false;
    const src = readFileSync(f, "utf8");
    const svgs = src.match(/<svg[\s\S]*?<\/svg>/g) ?? [];
    return svgs.some(
      (svg) =>
        /viewBox="0 0 24 24"/.test(svg) &&
        (svg.match(/<path\b/g) ?? []).length >= 2,
    );
  });
  assert.deepEqual(
    offenders,
    [],
    "multi-path 24-grid icons must come from the registry",
  );
});

test("C4 icons: an icon never replaces a control label", () => {
  const offenders = [];
  for (const f of files) {
    if (f.endsWith("BlueSkyzIcon.astro")) continue;
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      const [, attrs, body] = m;
      const hasName = /aria-label|aria-labelledby|title=/.test(attrs);
      const hasText =
        body
          .replace(/<svg[\s\S]*?<\/svg>/g, "")
          .replace(/<[^>]+>/g, "")
          .trim().length > 0;
      if (!hasName && !hasText) offenders.push(f);
    }
  }
  assert.deepEqual(
    [...new Set(offenders)],
    [],
    "icon-only controls need a textual accessible name",
  );
});
