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

test("localized product-profile primary CTAs use the app sign-in destination", () => {
  for (const lang of ["en", "vi", "zh"]) {
    const source = readFileSync(
      `src/pages/${lang}/products/[slug].astro`,
      "utf8",
    );
    assert.match(source, /data\.appAccess\?\.signInUrl/, lang);
    assert.doesNotMatch(source, /href=\{data\.primaryAction\.href\}/, lang);
    assert.match(source, /showSignIn=\{false\}/, lang);
  }

  const card = readFileSync("src/components/product/ProductCard.astro", "utf8");
  assert.match(card, /data\.primaryAction\.href/);
  assert.match(card, /href=\{primaryActionHref\}/);
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

test("public profiles do not offer private repository links as accessible proof", () => {
  for (const lang of ["en", "vi", "zh"]) {
    const source = readFileSync(
      `src/pages/${lang}/products/[slug].astro`,
      "utf8",
    );
    assert.doesNotMatch(source, /href: data\.proof\.repositoryUrl/);
  }
});

test("brand identity art is never advertised as a screenshot of running software", () => {
  const labels = readFileSync("src/data/site.ts", "utf8");
  assert.match(
    labels,
    /Brand identity artwork — not a screenshot of the running application/,
  );
  assert.match(
    labels,
    /Hình ảnh nhận diện thương hiệu — không phải ảnh chụp giao diện ứng dụng/,
  );
  assert.match(labels, /品牌视觉素材，并非应用运行界面的截图/);
});
