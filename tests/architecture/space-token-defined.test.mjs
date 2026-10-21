import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

/**
 * TRU-05: every `var(--space-*)` used in src/ must resolve to a `--space-*`
 * custom property defined somewhere in src/. An undefined spacing token makes
 * the declaration invalid at computed-value time, so the intended rhythm
 * silently collapses to the initial value (0 for padding/margin/gap).
 */

const ROOT = new URL("../../", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const EXT = /\.(?:css|astro|ts|tsx|js|mjs|jsx|html|svg)$/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return EXT.test(entry.name) ? [path] : [];
  });
}

/** @param {{ path: string, text: string }[]} files */
function undefinedSpaceTokens(files) {
  const defined = new Set();
  for (const { text } of files) {
    for (const m of text.matchAll(/(--space-[\w-]+)\s*:/g)) defined.add(m[1]);
  }
  const missing = [];
  for (const { path, text } of files) {
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/var\(\s*(--space-[\w-]+)/g)) {
        if (!defined.has(m[1])) missing.push(`${path}:${i + 1} ${m[1]}`);
      }
    });
  }
  return { defined, missing };
}

const files = walk(SRC).map((path) => ({
  path: relative(ROOT, path),
  text: readFileSync(path, "utf8"),
}));

test("TRU-05: src defines a spacing scale", () => {
  const { defined } = undefinedSpaceTokens(files);
  assert.ok(defined.size >= 4, `found ${[...defined].join(", ")}`);
});

test("TRU-05: every var(--space-*) used in src is defined in src", () => {
  assert.deepEqual(undefinedSpaceTokens(files).missing, []);
});

test("TRU-05 negative proof: an undefined spacing token is caught", () => {
  const broken = [
    ...files,
    {
      path: "src/styles/broken.css",
      text: ".x {\n  padding-block: var(--space-10);\n}\n",
    },
  ];
  assert.deepEqual(undefinedSpaceTokens(broken).missing, [
    "src/styles/broken.css:2 --space-10",
  ]);
});

test("TRU-05 negative proof: a fallback does not excuse an undefined token", () => {
  const { missing } = undefinedSpaceTokens([
    { path: "a.css", text: ":root { --space-4: 1rem; }" },
    {
      path: "b.css",
      text: ".y { gap: var( --space-7, 2rem) var(--space-4); }",
    },
  ]);
  assert.deepEqual(missing, ["b.css:1 --space-7"]);
});
