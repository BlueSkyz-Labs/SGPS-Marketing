import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const sourceUrl = new URL(
  "../../src/lib/experience-intent.ts",
  import.meta.url,
);

assert.ok(
  existsSync(sourceUrl),
  "experience intent source must exist before it is imported",
);

const source = readFileSync(sourceUrl, "utf8");
assert.ok(
  source.includes("export type ExperienceIntent"),
  "experience intent source must define the explicit intent model",
);

const { DEFAULT_EXPERIENCE_INTENT, EXPERIENCE_INTENTS, prioritizeForIntent } =
  await import(sourceUrl);

const items = Object.freeze([
  Object.freeze({ id: "support", kind: "support", surface: "contact" }),
  Object.freeze({ id: "security", kind: "trust", surface: "security" }),
  Object.freeze({ id: "catalog", kind: "product", surface: "products" }),
  Object.freeze({ id: "privacy", kind: "policy", surface: "privacy" }),
]);

test("publishes every declared explicit intent", () => {
  assert.deepEqual(EXPERIENCE_INTENTS, [
    "explore-products",
    "evaluate-product",
    "verify-trust",
    "understand-architecture",
    "work-with-us",
  ]);
  assert.equal(DEFAULT_EXPERIENCE_INTENT, "explore-products");
});

test("promotes existing items for a known intent", () => {
  assert.deepEqual(
    prioritizeForIntent(items, "verify-trust").map((item) => item.id),
    ["security", "privacy", "catalog", "support"],
  );
  assert.deepEqual(
    prioritizeForIntent(items, "work-with-us").map((item) => item.id),
    ["support", "catalog", "security", "privacy"],
  );
});

test("malformed intent fails closed to the declared default", () => {
  const expected = prioritizeForIntent(items, DEFAULT_EXPERIENCE_INTENT);

  for (const malformed of ["", "profile-visitor", null, undefined, 42, {}]) {
    assert.deepEqual(prioritizeForIntent(items, malformed), expected);
  }
});

test("membership is unchanged and the default remains complete", () => {
  const defaultItems = prioritizeForIntent(items);

  assert.equal(defaultItems.length, items.length);
  assert.deepEqual(
    [...defaultItems].sort((left, right) => left.id.localeCompare(right.id)),
    [...items].sort((left, right) => left.id.localeCompare(right.id)),
  );
  assert.equal(new Set(defaultItems.map((item) => item.id)).size, items.length);
});

test("promotion is deterministic, stable, and non-mutating", () => {
  const first = prioritizeForIntent(items, "evaluate-product");
  const second = prioritizeForIntent(items, "evaluate-product");

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.map((item) => item.id),
    ["catalog", "security", "privacy", "support"],
  );
  assert.deepEqual(
    items.map((item) => item.id),
    ["support", "security", "catalog", "privacy"],
  );
  assert.notEqual(first, items);
});

test("contains no tracking, persistence, network, or benchmarking primitives", () => {
  assert.doesNotMatch(
    source,
    /\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|navigator\s*\.\s*hardwareConcurrency|Date\.now|Math\.random|WebGL|canvas)\b/,
  );
});
