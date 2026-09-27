/**
 * Atlas premium plate (plan v5): static SVG/CSS only, every index row is
 * linked to exactly one plate node, and the CSS highlight map covers every
 * node the model can emit today.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const component = readFileSync("src/components/experience/Atlas.astro", "utf8");

test("atlas ships no client script", () => {
  assert.doesNotMatch(component, /<script\b/);
});

test("index rows and plate nodes share the data-atlas-i link", () => {
  assert.match(
    component,
    /data-atlas-node[\s\S]*?data-atlas-i=\{indexOf\.get\(node\.id\)\}/,
  );
  assert.match(
    component,
    /class=\{`atlas-node atlas-node--\$\{node\.kind\}`\}\s*data-atlas-i=/,
  );
});

test("highlight selectors cover a bounded node index range", () => {
  const indices = [
    ...component.matchAll(/\.atlas-index \[data-atlas-i="(\d+)"\]/g),
  ].map((match) => Number(match[1]));
  const max = Math.max(...indices);
  assert.equal(new Set(indices).size, max + 1, "contiguous 0..max selectors");
  assert.ok(max >= 39, "at least 40 linkable nodes");
});

test("claims and evidence use footnote codes, not truncated statements", () => {
  assert.match(component, /`C\$\{\+\+claimCount\}`/);
  assert.match(component, /`E\$\{\+\+evidenceCount\}`/);
  assert.doesNotMatch(component, /truncate\(/);
});
