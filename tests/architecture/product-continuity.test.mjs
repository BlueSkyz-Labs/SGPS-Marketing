import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

// --- Source-level convention guard (single source of truth) ---

const transitionSource = read("src/lib/product-transition.ts");
const productVisual = read("src/components/product/ProductVisual.astro");

test("naming convention has exactly one source in src/lib/product-transition.ts", () => {
  assert.match(
    transitionSource,
    /export function productTransitionName/,
    "productTransitionName must be exported",
  );
  assert.match(
    transitionSource,
    /product-\$\{kind\}-\$\{slug\}/,
    "name must combine kind + slug as `product-<kind>-<slug>`",
  );
  assert.match(
    transitionSource,
    /SAFE_SLUG\.test\(slug\)/,
    "slug must be validated against a safe-shape regex",
  );
  assert.doesNotMatch(
    transitionSource,
    /hardcoded view-transition-name/,
    "no hardcoded transition name strings in the convention source",
  );
});

test("product surfaces reference product-transition instead of hardcoding", () => {
  const flagship = read("src/components/product/FlagshipTheatre.astro");
  const card = read("src/components/product/ProductCard.astro");
  for (const [name, source] of [
    ["FlagshipTheatre", flagship],
    ["ProductCard", card],
  ]) {
    assert.match(
      source,
      /productTransitionStyle|product-transition/,
      `${name} must import/reference productTransitionStyle`,
    );
    assert.doesNotMatch(
      source,
      /view-transition-name:\s*product-/,
      `${name} must not hardcode a literal "view-transition-name: product-..." string`,
    );
  }
});

test("ProductVisual may forward continuity but never owns transition identity", () => {
  assert.match(productVisual, /transitionStyle/);
  assert.match(productVisual, /data-product-continuity=\{continuity\}/);
  assert.doesNotMatch(
    productVisual,
    /productTransitionStyle|product-transition/,
  );
  assert.doesNotMatch(productVisual, /view-transition-name/);
});

// --- Static-first contract guard ---

test("product surfaces contain no client hydration directives", () => {
  const flagship = read("src/components/product/FlagshipTheatre.astro");
  const card = read("src/components/product/ProductCard.astro");
  for (const [name, source] of [
    ["FlagshipTheatre", flagship],
    ["ProductCard", card],
    ["ProductVisual", productVisual],
  ]) {
    assert.doesNotMatch(
      source,
      /client:\w+/, // Astro hydration directive (e.g. client:load, client:visible)
      `${name} must not declare a client hydration directive`,
    );
  }
});

test("product surfaces contain no animation-framework or framework imports", () => {
  const flagship = read("src/components/product/FlagshipTheatre.astro");
  const card = read("src/components/product/ProductCard.astro");
  const house = read("src/components/product/ProductHouse.astro");
  for (const [name, source] of [
    ["FlagshipTheatre", flagship],
    ["ProductCard", card],
    ["ProductHouse", house],
    ["ProductVisual", productVisual],
  ]) {
    assert.doesNotMatch(
      source,
      /import\s+.*\b(gsap|three|three\.js|gsap\/)\b/,
      `${name} must not import gsap/three animation frameworks`,
    );
    assert.doesNotMatch(
      source,
      /import\s+.*\b(React|Vue|Svelte)\b/,
      `${name} must not import React/Vue/Svelte framework bindings`,
    );
  }
});

// --- Fixture-destination contract alignment ---

test("fixture destination pages reference the same naming convention", () => {
  const enDest = read(
    "tests/e2e/fixtures/parity-app/src/pages/en/products/fixture-flagship.astro",
  );
  const viDest = read(
    "tests/e2e/fixtures/parity-app/src/pages/vi/products/fixture-flagship.astro",
  );
  for (const [name, source] of [
    ["fixture-flagship EN", enDest],
    ["fixture-flagship VI", viDest],
  ]) {
    assert.match(
      source,
      /productTransitionStyle/,
      `${name} must reference productTransitionStyle`,
    );
    assert.match(
      source,
      /data-product-profile-title/,
      `${name} destination title must carry the profile-title marker`,
    );
    // Source is Astro frontmatter (`style={cardName}`); the literal inline name
    // is emitted at build time, not present in source. Assert on the source-level
    // variables (`cardName`, `mediaName`) and profile-title marker instead.
    assert.match(source, /const cardName = productTransitionStyle\(/);
    assert.match(source, /const mediaName = productTransitionStyle\(/);
  }
});

// --- Architecture-level guard: no second registry or invented identity ---

test("fixture product data is synthetic and never claims production truth", () => {
  const fixtures = read(
    "tests/e2e/fixtures/parity-app/src/data/fixture-products.ts",
  );
  assert.match(
    fixtures,
    /Fixture/,
    "fixture records must be explicitly synthetic",
  );
  assert.match(
    fixtures,
    /never deployed|never shipped/,
    "fixture data must declare it is never deployed",
  );
});
