import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const componentPath = new URL(
  "../../src/components/integrity/TruthState.astro",
  import.meta.url,
);

test("truth-state component exists", () => {
  assert.ok(existsSync(componentPath), "TruthState.astro must exist");
});

const component = existsSync(componentPath)
  ? read("src/components/integrity/TruthState.astro")
  : "";
const integrityData = read("src/data/integrity.ts");

test("every truth state of the live union has EN and VI text", () => {
  const union = integrityData.match(/export type TruthState =([\s\S]*?);/)?.[1];
  assert.ok(union, "TruthState union must exist in src/data/integrity.ts");
  const states = [...union.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
  assert.equal(states.length, 5, "expected five truth states");
  for (const state of states) {
    const block = component.match(
      new RegExp(`(?:${state}|"${state}"):\\s*\\{[^}]*\\}`, "s"),
    )?.[0];
    assert.ok(block, `state "${state}" missing from the component map`);
    assert.match(block, /en:\s*"/, `state "${state}" needs EN text`);
    assert.match(block, /vi:\s*"/, `state "${state}" needs VI text`);
  }
});

test("truth grammar rejects scoring, certification, and assurance badges", () => {
  // Comments may name the banned concepts; strip them before asserting.
  const stripped = component
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  assert.doesNotMatch(stripped, /trustScore/i);
  assert.doesNotMatch(stripped, /maturityScore/i);
  assert.doesNotMatch(stripped, /confidence/i);
  assert.doesNotMatch(stripped, /\d+%/);
  assert.doesNotMatch(stripped, /verified/i);
  assert.doesNotMatch(stripped, /certified/i);
  assert.doesNotMatch(stripped, /badge/i);
});

test("glyphs are decorative and meaning is textual without animation", () => {
  assert.match(component, /aria-hidden="true"/, "glyph must be aria-hidden");
  assert.match(component, /truth-state__label/, "visible text label required");
  assert.doesNotMatch(component, /animation/, "no continuous animation");
});
