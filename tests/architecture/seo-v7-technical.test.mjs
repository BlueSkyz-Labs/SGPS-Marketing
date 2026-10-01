/**
 * v7 SEO technical fixes: root gateway JSON-LD (SEO-01/02/24), noindex print
 * views kept out of the sitemap (SEO-11), localized og:image:alt (SEO-14).
 * Every guard has a negative proof where the invariant is broken on purpose.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  isNoindexPath,
  organizationJsonLd,
  PUBLIC_STATIC_PATHS,
  safeJsonLd,
  websiteJsonLd,
} from "../../src/lib/seo.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const gateway = readFileSync("src/pages/index.astro", "utf8");
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");

// --- gateway JSON-LD ------------------------------------------------------

const gatewayEmitsSiteLd = (src) =>
  /organizationJsonLd\(SITE\.url\)/.test(src) &&
  /websiteJsonLd\(SITE\.url\)/.test(src) &&
  /type="application\/ld\+json"/.test(src) &&
  /safeJsonLd\(data\)/.test(src);

test("root gateway renders Organization and WebSite JSON-LD from the shared builders", () => {
  assert.equal(gatewayEmitsSiteLd(gateway), true);
  // The JSON-LD sits in <head>, before <style>, and stays a data block.
  const head = gateway.slice(0, gateway.indexOf("</head>"));
  assert.match(head, /type="application\/ld\+json"/);
});

test("negative proof: a gateway without the builders or the script is rejected", () => {
  assert.equal(
    gatewayEmitsSiteLd(gateway.replace("websiteJsonLd(SITE.url)", "null")),
    false,
  );
  assert.equal(
    gatewayEmitsSiteLd(gateway.replace("organizationJsonLd(SITE.url)", "null")),
    false,
  );
  assert.equal(
    gatewayEmitsSiteLd(gateway.replace("application/ld+json", "text/plain")),
    false,
  );
});

test("WebSite and Organization url is the root with a trailing slash, logo-only", () => {
  for (const base of [
    "https://blueskyzlabs.com",
    "https://blueskyzlabs.com/",
  ]) {
    const site = websiteJsonLd(base);
    const org = organizationJsonLd(base);
    assert.equal(site.url, "https://blueskyzlabs.com/", base);
    assert.equal(site.publisher.url, "https://blueskyzlabs.com/", base);
    assert.equal(org.url, "https://blueskyzlabs.com/", base);
    assert.equal(org.logo, "https://blueskyzlabs.com/icons/icon-512x512.png");
    for (const field of ["sameAs", "contactPoint", "alternateName"]) {
      assert.equal(field in org, false, `org ${field}`);
      assert.equal(field in site, false, `site ${field}`);
    }
  }
});

test("negative proof: the old slashless url would not equal the canonical root", () => {
  assert.notEqual(
    "https://blueskyzlabs.com",
    websiteJsonLd("https://x.test").url,
  );
  assert.equal(websiteJsonLd("https://x.test").url.endsWith("/"), true);
});

test("gateway JSON-LD serializes safely", () => {
  const raw = safeJsonLd(websiteJsonLd("https://blueskyzlabs.com"));
  assert.equal(JSON.parse(raw)["@type"], "WebSite");
  assert.equal(raw.includes("<"), false);
});

// --- print views ----------------------------------------------------------

const printPage = (lang) =>
  readFileSync(`src/pages/${lang}/dossier/print/index.astro`, "utf8");
const printIsNoindexFollow = (src) =>
  /^\s+noindex\s*$/m.test(src) && /^\s+followLinks\s*$/m.test(src);

test("every dossier print view is noindex,follow", () => {
  for (const lang of LANGS) {
    assert.equal(printIsNoindexFollow(printPage(lang)), true, lang);
  }
  assert.match(layout, /"noindex, follow"/);
  assert.match(layout, /<meta name="robots" content=\{robotsContent\} \/>/);
});

test("negative proof: a print view missing noindex or follow is rejected", () => {
  const src = printPage("en");
  assert.equal(
    printIsNoindexFollow(src.replace(/^\s+noindex\s*$/m, "")),
    false,
  );
  assert.equal(
    printIsNoindexFollow(src.replace(/^\s+followLinks\s*$/m, "")),
    false,
  );
});

test("print views are dropped from the sitemap list but stay public routes", () => {
  const printPaths = PUBLIC_STATIC_PATHS.filter((p) =>
    p.endsWith("/dossier/print/"),
  );
  assert.equal(printPaths.length, LANGS.length);
  for (const path of printPaths) assert.equal(isNoindexPath(path), true, path);
  for (const path of PUBLIC_STATIC_PATHS) {
    if (!path.endsWith("/dossier/print/")) {
      assert.equal(isNoindexPath(path), false, path);
    }
  }
  assert.match(sitemap, /filter\(\(path\) => !isNoindexPath\(path\)\)/);
});

test("negative proof: a sitemap that skips the filter, or a filter that matches nothing, is rejected", () => {
  assert.equal(
    /filter\(\(path\) => !isNoindexPath\(path\)\)/.test(
      sitemap.replace("!isNoindexPath(path)", "true"),
    ),
    false,
  );
  assert.equal(isNoindexPath("/en/dossier/"), false);
  assert.equal(isNoindexPath("/en/dossier/print"), false);
});

// --- og:image:alt ---------------------------------------------------------

test("og:image:alt and twitter:image:alt are localized per locale", () => {
  assert.match(
    layout,
    /const ogImageAlt = DEFAULT_OG_IMAGE_ALT\[currentLang\]/,
  );
  assert.match(layout, /og:image:alt" content=\{ogImageAlt\}/);
  assert.match(layout, /twitter:image:alt" content=\{ogImageAlt\}/);
  assert.equal(DEFAULT_OG_IMAGE_ALT.en, DEFAULT_OG_IMAGE.alt);
  const seen = new Set();
  for (const lang of LANGS) {
    const alt = DEFAULT_OG_IMAGE_ALT[lang];
    assert.ok(alt.length > 10, lang);
    assert.equal(seen.has(alt), false, `${lang} alt must be its own string`);
    seen.add(alt);
  }
  assert.match(DEFAULT_OG_IMAGE_ALT.vi, /Trí tuệ\. Nâng tầm\. Tác động\./);
  assert.match(DEFAULT_OG_IMAGE_ALT.zh, /智能。提升。影响。/);
  assert.match(DEFAULT_OG_IMAGE_ALT["zh-hant"], /智慧。提升。影響。/);
});

test("negative proof: an English alt on a non-English locale is detected", () => {
  const stillEnglish = (lang, alt) =>
    lang !== "en" && alt === DEFAULT_OG_IMAGE.alt;
  for (const lang of LANGS) {
    assert.equal(stillEnglish(lang, DEFAULT_OG_IMAGE_ALT[lang]), false, lang);
  }
  assert.equal(stillEnglish("vi", DEFAULT_OG_IMAGE.alt), true);
  assert.equal(
    /og:image:alt" content=\{ogImageAlt\}/.test(
      layout.replace(
        'property="og:image:alt" content={ogImageAlt}',
        'property="og:image:alt" content={ogImageMeta.alt}',
      ),
    ),
    false,
  );
});
