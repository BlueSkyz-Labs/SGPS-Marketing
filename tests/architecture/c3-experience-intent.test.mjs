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

// ------------------------------------------------------------------ //
// Task 2 contract: Visitor-Controlled Intent UI (C3-D)
// ------------------------------------------------------------------ //

const intentControlUrl = new URL(
  "../../src/components/experience/IntentControl.astro",
  import.meta.url,
);
const experienceIntentUrl = new URL(
  "../../src/scripts/experience-intent.ts",
  import.meta.url,
);

test("IntentControl.astro exists (Task 2 control surface)", () => {
  assert.ok(
    existsSync(intentControlUrl),
    "IntentControl.astro must exist before it is imported",
  );
});

test("IntentControl renders all five declared intents in server HTML", () => {
  const src = readFileSync(intentControlUrl, "utf8");
  // The component maps over EXPERIENCE_INTENTS which must include all five.
  assert.ok(
    src.includes("EXPERIENCE_INTENTS.map") ||
      src.includes("EXPERIENCE_INTENTS.map("),
    "IntentControl must iterate over the canonical EXPERIENCE_INTENTS array",
  );
  for (const intent of [
    "explore-products",
    "evaluate-product",
    "verify-trust",
    "understand-architecture",
    "work-with-us",
  ]) {
    assert.ok(
      src.includes(`"${intent}"`) || src.includes(`'${intent}'`),
      `IntentControl must reference the "${intent}" intent id`,
    );
  }
});

test("IntentControl uses the canonical intent enum, not invented ids", () => {
  const src = readFileSync(intentControlUrl, "utf8");
  assert.ok(
    src.includes("experience-intent"),
    "IntentControl must consume the canonical experience-intent model",
  );
  assert.ok(
    !src.includes("understand-blueskyz"),
    'IntentControl must not use the legacy "understand-blueskyz" id',
  );
});

test("IntentControl carries trilingual copy for every intent", () => {
  const src = readFileSync(intentControlUrl, "utf8");
  for (const intent of [
    "explore-products",
    "evaluate-product",
    "verify-trust",
    "understand-architecture",
    "work-with-us",
  ]) {
    const intentStart = src.indexOf(`"${intent}"`);
    assert.ok(intentStart !== -1, `IntentControl must reference "${intent}"`);
    const intentBlock = src.slice(intentStart, intentStart + 800);
    assert.ok(
      intentBlock.includes("en:") &&
        intentBlock.includes("vi:") &&
        intentBlock.includes("zh:"),
      `IntentControl must carry en/vi/zh labels for "${intent}"`,
    );
  }
});

test("IntentControl server HTML includes the control marker", () => {
  const src = readFileSync(intentControlUrl, "utf8");
  assert.ok(
    src.includes("data-intent-control"),
    "IntentControl must render the data-intent-control marker for client scripts",
  );
});

test("experience-intent script contains no tracking, persistence, network, or benchmarking primitives", () => {
  assert.ok(
    existsSync(experienceIntentUrl),
    "experience-intent.ts must exist before it is imported",
  );
  const src = readFileSync(experienceIntentUrl, "utf8");
  assert.doesNotMatch(
    src,
    /\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|navigator\s*\.\s*hardwareConcurrency|Date\.now|Math\.random|WebGL|canvas)\b/,
  );
});

test("experience-intent script is idempotent (double-init safe)", () => {
  const src = readFileSync(experienceIntentUrl, "utf8");
  assert.ok(
    src.includes("data-intent-control-ready"),
    "experience-intent must guard against double-init with a ready marker",
  );
});

test("experience-intent dispatches a semantic event, never sends data", () => {
  const src = readFileSync(experienceIntentUrl, "utf8");
  assert.ok(
    src.includes("CustomEvent") || src.includes("dispatchEvent"),
    "experience-intent must dispatch a semantic event for observers",
  );
  assert.ok(
    !src.includes("navigator.sendBeacon") && !src.includes("fetch("),
    "experience-intent must never transmit data to a remote endpoint",
  );
});
