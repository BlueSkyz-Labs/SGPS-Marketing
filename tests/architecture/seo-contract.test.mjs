import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("SEO helpers keep absolute URLs and Organization JSON-LD truthful", async () => {
  const seo = await import("../../src/lib/seo.ts");
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
  const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
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
  const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");
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
  const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");
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
