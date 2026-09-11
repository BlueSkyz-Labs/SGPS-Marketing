import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("product profile route is statically wired for public entries", () => {
  const path = "src/pages/products/[slug].astro";
  assert.equal(existsSync(path), true);
  const source = readFileSync(path, "utf8");
  assert.match(source, /export async function getStaticPaths/);
  assert.match(source, /getPublicProducts/);
  assert.match(source, /product\.data\.slug/);
  assert.match(source, /A BlueSkyz Labs product|endorsement/);
  assert.match(source, /primaryAction/);
});

test("product cards deep-link into locale-aware profile routes", () => {
  const card = readFileSync("src/components/product/ProductCard.astro", "utf8");
  const labels = readFileSync("src/data/site.ts", "utf8");
  assert.match(card, /getProductProfilePath\(lang, data\.slug\)/);
  assert.match(card, /SHARED_LABELS\.viewProfile/);
  assert.match(labels, /View profile/);
});

test("sitemap emits product profile URLs from data.slug", () => {
  const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");
  assert.match(sitemap, /product\.data\.slug/);
  assert.doesNotMatch(sitemap, /product\.id/);
});
