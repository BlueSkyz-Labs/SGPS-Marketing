/**
 * axe `aria-prohibited-attr`: aria-label/aria-labelledby on a role-less
 * generic element (div/span/p) is not reliably exposed. Such elements must
 * carry a role that supports naming (e.g. role="group").
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory()
      ? walk(full)
      : full.endsWith(".astro")
        ? [full]
        : [];
  });

// Opening tags of generic elements; tolerates `>` inside {expressions}.
const TAG = /<(div|span|p)\b((?:[^>{]|\{[^}]*\})*)>/g;

export const unnamedGenericWithLabel = (source) => {
  const hits = [];
  for (const m of source.matchAll(TAG)) {
    const attrs = m[2];
    if (
      /\baria-(label|labelledby)\s*=/.test(attrs) &&
      !/\brole\s*=/.test(attrs)
    )
      hits.push(m[0].replace(/\s+/g, " ").slice(0, 120));
  }
  return hits;
};

test("no role-less div/span/p carries aria-label or aria-labelledby", () => {
  const offenders = walk("src").flatMap((file) =>
    unnamedGenericWithLabel(readFileSync(file, "utf8")).map(
      (hit) => `${file}: ${hit}`,
    ),
  );
  assert.deepEqual(offenders, []);
});

test("negative proof: a role-less labelled div is detected", () => {
  assert.equal(
    unnamedGenericWithLabel('<div class="x" aria-label="Platforms">').length,
    1,
  );
  assert.equal(
    unnamedGenericWithLabel('<div role="group" aria-label="Platforms">').length,
    0,
  );
});
