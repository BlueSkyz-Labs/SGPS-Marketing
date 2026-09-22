import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const seo = await import("../../src/lib/seo.ts");
const i18n = await import("../../src/lib/i18n.ts");
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");

test("published locale paths have reciprocal hreflang targets", () => {
  const supported = new Set(i18n.SUPPORTED_LANGUAGES);
  assert.deepEqual([...supported], ["en", "vi", "zh"]);

  for (const path of seo.PUBLIC_STATIC_PATHS) {
    const links = seo.hreflangLinks(path, "https://blueskyzlabs.com");
    assert.equal(
      links.length,
      supported.size,
      `${path} must cover each locale`,
    );
    assert.deepEqual(
      links.map((link) => link.hreflang),
      ["en", "vi", "zh-Hans"],
      `${path} must expose one stable hreflang per locale`,
    );
    assert.equal(
      new Set(links.map((link) => link.href)).size,
      links.length,
      `${path} must not duplicate hreflang URLs`,
    );
    assert.equal(
      new Set(links.map((link) => new URL(link.href).pathname)).size,
      links.length,
      `${path} must not emit duplicate localized paths`,
    );
  }
});

test("BaseLayout emits complete locale-safe SEO metadata", () => {
  assert.match(layout, /<html lang=\{currentLang\} dir="ltr">/);
  assert.match(layout, /rel="canonical"/);
  assert.match(layout, /hreflang="x-default"/);
  assert.match(layout, /og:url/);
  assert.match(layout, /twitter:card/);
  assert.match(layout, /organizationJsonLd/);
  assert.match(layout, /websiteJsonLd/);
  assert.match(layout, /breadcrumbJsonLd/);
  assert.doesNotMatch(layout, /href="https?:\/\/[^"{]+"/);
});

test("sitemap enumerates canonical localized surfaces and all three evidence locales", () => {
  assert.match(sitemap, /PUBLIC_STATIC_PATHS/);
  assert.match(sitemap, /SUPPORTED_LANGUAGES/);
  assert.doesNotMatch(sitemap, /\["en",\s*"vi"\]/);
  assert.doesNotMatch(sitemap, /`\/products\/\$\{product\.data\.slug\}\/`/);
  assert.doesNotMatch(sitemap, /workers\.dev|pages\.dev|tonydemo/i);
});

test("SEO helpers keep absolute URLs and Organization JSON-LD truthful", async () => {
  assert.equal(
    seo.absoluteUrl("https://example.com", "/products/"),
    "https://example.com/products/",
  );
  assert.equal(
    seo.absoluteUrl("https://example.com/", "about/"),
    "https://example.com/about/",
  );

  const org = seo.organizationJsonLd("https://example.com/");
  assert.equal(org["@type"], "Organization");
  assert.equal(org.name, "BlueSkyz Labs");
  assert.equal(org.url, "https://example.com/");

  assert.equal(
    seo.safeJsonLd({ name: "</script><script>alert(1)" }),
    '{"name":"\\u003c/script>\\u003cscript>alert(1)"}',
  );
});

test("BaseLayout wires canonical, OG, and structured data via shared non-prod helper", () => {
  assert.match(layout, /rel="canonical"/);
  assert.match(layout, /og:image/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /organizationJsonLd/);
  assert.match(layout, /websiteJsonLd/);
  assert.match(layout, /safeJsonLd/);
  assert.match(layout, /isNonProductionSiteUrl/);
  assert.doesNotMatch(layout, /portfolio\.tonydemo\.com/);
  assert.doesNotMatch(layout, /isLocalFallback/);
});

test("robots and sitemap endpoints exist and reference public routes only", () => {
  assert.equal(existsSync("src/pages/robots.txt.ts"), true);
  assert.equal(existsSync("src/pages/sitemap.xml.ts"), true);
  const robots = readFileSync("src/pages/robots.txt.ts", "utf8");
  assert.match(robots, /isNonProductionSiteUrl/);
  assert.match(robots, /Disallow: \//);
  assert.match(sitemap, /getPublicProducts/);
  assert.match(sitemap, /PUBLIC_STATIC_PATHS/);
  assert.match(sitemap, /getEvidencePassportIds/);
  assert.doesNotMatch(sitemap, /portfolio\.tonydemo\.com/);
});

test("default OG asset is committed masterbrand art", () => {
  assert.equal(existsSync("public/social/og-default.png"), true);
});

test("sitemap.xml.ts gates non-production identity like robots.txt", () => {
  assert.match(sitemap, /isNonProductionSiteUrl/);
});

test("HSTS preload remains deferred in live contract evidence", () => {
  const headers = readFileSync("public/_headers", "utf8");
  assert.doesNotMatch(headers, /preload/);
  const earlyRedeploy = readFileSync(
    "docs/evidence/2026-09-04-workers-redeploy.md",
    "utf8",
  );
  assert.doesNotMatch(earlyRedeploy, /includeSubDomains; preload/);
});

test("social locale and skip link reflect the published language", () => {
  assert.match(
    layout,
    /OG_LOCALES\s*=\s*\{\s*en:\s*"en_US",\s*vi:\s*"vi_VN",\s*zh:\s*"zh_CN"/,
  );
  assert.match(layout, /ogAlternates\.map/);
  assert.match(layout, /locale !== ogLocale/);
  assert.doesNotMatch(layout, /currentLang === "vi" \? "vi_VN" : "en_US"/);
  assert.match(layout, /跳转到主要内容/);
});
