import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const card = read("src/components/product/ProductCard.astro");
const header = read("src/components/layout/Header.astro");
const act = read("src/lib/act.ts");
const productRoutes = read("src/lib/product-routes.ts");

test("shared product components never emit bare /products/ paths", () => {
  for (const [name, source] of [["ProductCard", card]]) {
    assert.doesNotMatch(
      source,
      /href="\/products\/"/,
      `${name} must not hard-code the bare /products/ href`,
    );
    assert.doesNotMatch(
      source,
      /`\/products\//,
      `${name} must build product URLs through the locale-aware helpers`,
    );
  }
});

test("shared product components carry locale-aware labels only", () => {
  assert.doesNotMatch(
    card,
    /View profile/,
    "ProductCard profile CTA must come from localized labels",
  );
});

test("header chrome labels and CTA are centralized and locale-aware", () => {
  assert.doesNotMatch(header, /"Contact us"/);
  assert.doesNotMatch(header, /"Explore products"/);
  assert.doesNotMatch(header, /"Search pages"/);
  assert.doesNotMatch(header, /"Tìm trang"/);
  assert.match(
    header,
    /SHARED_LABELS|getSharedLabels/,
    "Header must consume centralized shared labels",
  );
});

test("act CTA helpers are locale-aware and never return bare roots", () => {
  assert.match(act, /lang/, "act helpers must accept a language");
  assert.doesNotMatch(act, /href: "\/contact\/"/);
  assert.doesNotMatch(act, /href: "\/about\/"/);
  assert.doesNotMatch(act, /href: "\/security\/"/);
  assert.match(
    act,
    /`\/\$\{lang\}\//,
    "act helpers must return locale-prefixed hrefs",
  );
});

test("product route helpers are locale-aware", () => {
  assert.match(productRoutes, /getProductIndexPath/);
  assert.match(productRoutes, /getProductProfilePath/);
  assert.match(productRoutes, /`\/\$\{lang\}\/products\//);
});

test("locale-prefixed CTA helpers are never double-prefixed by consumers", () => {
  const hero = read("src/components/sections/Hero.astro");
  for (const [name, source] of [["Hero", hero]]) {
    assert.doesNotMatch(
      source,
      /\/(en|vi)\$\{empty/,
      `${name} must not re-prefix locale-aware CTA hrefs`,
    );
    assert.doesNotMatch(
      source,
      /emptyPrimary\.label ===|emptySecondary\.label ===/,
      `${name} must not re-map already-localized CTA labels`,
    );
  }
});
