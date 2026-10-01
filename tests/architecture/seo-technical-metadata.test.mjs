/**
 * Copy/SEO Phase 2 — technical metadata invariants.
 * Every blocking predicate has a negative proof: the protected invariant is
 * broken on purpose and the predicate must reject it.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  GUIDE_META,
  PAGE_META,
  PRODUCT_META,
} from "../../src/data/page-meta.ts";
import { SITE, getFooterLinks } from "../../src/data/site.ts";
import {
  getProductBreadcrumbTrail,
  productBreadcrumbJsonLd,
} from "../../src/lib/breadcrumbs.ts";
import {
  DEFAULT_OG_IMAGE,
  PUBLIC_STATIC_PATHS,
  productJsonLd,
  websiteJsonLd,
  organizationJsonLd,
} from "../../src/lib/seo.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");

// --- predicates -----------------------------------------------------------

/** Mirrors BaseLayout: descriptor + " | " + brand unless the brand is in it. */
const composeTitle = (title) =>
  title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;

const hasSingleSeparator = (full) =>
  full.split(" | ").length === 2 && !/[·—]/.test(full);

const charCount = (text) => [...text].length;
const isLatin = (lang) => lang === "en" || lang === "vi";
const inDescriptionBand = (lang, text) => {
  const n = charCount(text);
  return isLatin(lang) ? n >= 120 && n <= 160 : n >= 40 && n <= 85;
};

const hasViewportInitialScale = (source) =>
  /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/.test(
    source,
  );

const pageCallsBreadcrumb = (source) =>
  /productBreadcrumbJsonLd\(/.test(source) &&
  /"BreadcrumbList"|breadcrumbStructuredData/.test(source);

const passesOgImage = (source) => /\bogImage=/.test(source);

function allMeta() {
  const rows = [];
  for (const lang of LANGS) {
    for (const [key, meta] of Object.entries(PAGE_META[lang])) {
      rows.push([`${lang}/${key}`, lang, meta]);
    }
    for (const [slug, byLang] of Object.entries(PRODUCT_META)) {
      rows.push([`${lang}/product/${slug}`, lang, byLang[lang]]);
    }
    for (const [slug, byLang] of Object.entries(GUIDE_META)) {
      rows.push([`${lang}/guide/${slug}`, lang, byLang[lang]]);
    }
  }
  return rows;
}

// --- viewport -------------------------------------------------------------

test("BaseLayout viewport declares initial-scale=1", () => {
  assert.equal(hasViewportInitialScale(layout), true);
});

test("negative proof: a viewport without initial-scale is rejected", () => {
  const broken = layout.replace(", initial-scale=1", "");
  assert.notEqual(broken, layout);
  assert.equal(hasViewportInitialScale(broken), false);
});

// --- titles ---------------------------------------------------------------

test("the layout uses one ' | ' separator, never '·' or '—'", () => {
  assert.match(layout, /`\$\{title\} \| \$\{SITE\.name\}`/);
  assert.doesNotMatch(layout, /\$\{title\} [·—] \$\{SITE\.name\}/);
});

test("every authored title composes to a single-separator, brand-last title", () => {
  for (const [id, , meta] of allMeta()) {
    const full = composeTitle(meta.title);
    assert.equal(hasSingleSeparator(full), true, `${id}: ${full}`);
    assert.ok(full.endsWith(SITE.name) || meta.title.startsWith(SITE.name), id);
    assert.ok(meta.title.length > 0, id);
  }
});

test("Vietnamese About title does not repeat the brand", () => {
  assert.equal(PAGE_META.vi.about.title.includes("BlueSkyz"), false);
  assert.equal(PAGE_META.vi.about.title, "Giới thiệu");
});

test("home titles name the brand once and carry a descriptor", () => {
  for (const lang of LANGS) {
    const full = composeTitle(PAGE_META[lang].home.title);
    assert.equal(full.split(SITE.name).length - 1, 1, lang);
    assert.ok(full.length > SITE.name.length, lang);
  }
});

test("negative proof: mixed separators and repeated brand are rejected", () => {
  assert.equal(hasSingleSeparator("Products · BlueSkyz Labs"), false);
  assert.equal(hasSingleSeparator("Sổ Trọ — BlueSkyz Labs"), false);
  assert.equal(hasSingleSeparator("A | B | BlueSkyz Labs"), false);
  assert.equal(hasSingleSeparator("Về BlueSkyz | BlueSkyz Labs"), true);
  assert.equal("Về BlueSkyz".includes("BlueSkyz"), true);
});

// --- descriptions ---------------------------------------------------------

test("descriptions fall in their length band (EN/VI 120-160, CJK 40-85)", () => {
  for (const [id, lang, meta] of allMeta()) {
    assert.equal(
      inDescriptionBand(lang, meta.description),
      true,
      `${id}: ${charCount(meta.description)} chars`,
    );
  }
});

test("Vietnamese home description does not start in English", () => {
  const { description } = PAGE_META.vi.home;
  assert.doesNotMatch(description, /^Intelligence/);
  assert.match(description, /^BlueSkyz Labs đang xây dựng/);
});

test("product and home descriptions keep 'in development' status visible", () => {
  const status = {
    en: /in development/i,
    vi: /đang phát triển/i,
    zh: /开发中/,
    "zh-hant": /開發中/,
  };
  for (const lang of LANGS) {
    assert.match(PAGE_META[lang].home.description, status[lang], lang);
    for (const byLang of Object.values(PRODUCT_META)) {
      assert.match(byLang[lang].description, status[lang], lang);
    }
  }
});

test("negative proof: out-of-band descriptions are rejected", () => {
  assert.equal(
    inDescriptionBand(
      "en",
      "Explore BlueSkyz Labs products with truthful status.",
    ),
    false,
  );
  assert.equal(inDescriptionBand("en", "x".repeat(182)), false);
  assert.equal(inDescriptionBand("zh", "您请求的页面无法找到。"), false);
  assert.equal(inDescriptionBand("vi", "x".repeat(140)), true);
});

// --- JSON-LD --------------------------------------------------------------

test("WebSite and SoftwareApplication declare inLanguage", () => {
  assert.deepEqual(websiteJsonLd("https://blueskyzlabs.com/").inLanguage, [
    "en",
    "vi",
    "zh-Hans",
    "zh-Hant",
  ]);
  const tags = { en: "en", vi: "vi", zh: "zh-Hans", "zh-hant": "zh-Hant" };
  for (const lang of LANGS) {
    const app = productJsonLd(
      { name: "Sổ Trọ", description: "d", slug: "sotro", platforms: ["web"] },
      "https://blueskyzlabs.com",
      lang,
    );
    assert.equal(app.inLanguage, tags[lang], lang);
  }
});

test("owner-gated Organization/SoftwareApplication fields stay absent", () => {
  const org = organizationJsonLd("https://blueskyzlabs.com/");
  for (const field of ["logo", "sameAs", "contactPoint"]) {
    assert.equal(field in org, false, field);
  }
  const app = productJsonLd(
    { name: "Sổ Trọ", description: "d", slug: "sotro", platforms: ["web"] },
    "https://blueskyzlabs.com",
    "en",
  );
  assert.equal("applicationCategory" in app, false);
  assert.equal(
    websiteJsonLd("https://blueskyzlabs.com/").url,
    "https://blueskyzlabs.com/",
    "WebSite.url is an Owner decision (F16) and is unchanged",
  );
});

test("product and guide pages emit a BreadcrumbList in every locale", () => {
  for (const lang of LANGS) {
    const product = readFileSync(
      `src/pages/${lang}/products/[slug].astro`,
      "utf8",
    );
    const guide = readFileSync(
      `src/pages/${lang}/products/[slug]/guide.astro`,
      "utf8",
    );
    assert.equal(pageCallsBreadcrumb(product), true, `${lang} product`);
    assert.equal(pageCallsBreadcrumb(guide), true, `${lang} guide`);
  }
});

test("negative proof: a page without the breadcrumb call is rejected", () => {
  const source = readFileSync("src/pages/en/products/[slug].astro", "utf8");
  const broken = source.replaceAll("productBreadcrumbJsonLd(", "noop(");
  assert.equal(pageCallsBreadcrumb(broken), false);
});

test("product breadcrumb mirrors Home > Products > product (> guide)", () => {
  for (const lang of LANGS) {
    const home = getFooterLinks(lang).find(
      (item) => item.href === `/${lang}/products/`,
    );
    assert.ok(home, `${lang} footer declares the Products label`);
    const trail = getProductBreadcrumbTrail(lang, "sotro", "Sổ Trọ");
    assert.deepEqual(
      trail.map((crumb) => crumb.path),
      [`/${lang}/`, `/${lang}/products/`, `/${lang}/products/sotro/`],
    );
    assert.equal(trail[1].name, home.label);
    assert.equal(trail[2].name, "Sổ Trọ");

    const guideTrail = getProductBreadcrumbTrail(lang, "sotro", "Sổ Trọ", "G");
    assert.equal(guideTrail.length, 4);
    assert.equal(guideTrail[3].path, `/${lang}/products/sotro/guide/`);

    const ld = productBreadcrumbJsonLd(lang, "sotro", "Sổ Trọ", SITE.url);
    assert.equal(ld["@type"], "BreadcrumbList");
    assert.deepEqual(
      ld.itemListElement.map((item) => item.position),
      [1, 2, 3],
    );
    for (const item of ld.itemListElement) {
      assert.match(item.item, /^https?:\/\//);
    }
  }
});

test("the visible product breadcrumb label matches the JSON-LD label", () => {
  const expected = {
    en: "Products",
    vi: "Sản phẩm",
    zh: "产品",
    "zh-hant": "產品",
  };
  for (const lang of LANGS) {
    const source = readFileSync(
      `src/pages/${lang}/products/[slug].astro`,
      "utf8",
    );
    const trail = getProductBreadcrumbTrail(lang, "sotro", "Sổ Trọ");
    assert.equal(trail[1].name, expected[lang], lang);
    assert.ok(source.includes(expected[lang]), `${lang} visible label`);
  }
});

test("negative proof: the guide crumb appears only when a guide name is given", () => {
  assert.equal(getProductBreadcrumbTrail("en", "sotro", "Sổ Trọ").length, 3);
  assert.equal(
    getProductBreadcrumbTrail("en", "sotro", "Sổ Trọ", "Guide").length,
    4,
  );
});

// --- Open Graph image -----------------------------------------------------

test("default OG image declares width, height and alt", () => {
  assert.deepEqual(
    [DEFAULT_OG_IMAGE.width, DEFAULT_OG_IMAGE.height],
    [1200, 630],
  );
  assert.ok(DEFAULT_OG_IMAGE.alt.length > 10);
  assert.match(layout, /og:image:width/);
  assert.match(layout, /og:image:height/);
  assert.match(layout, /og:image:alt/);
});

test("the committed default card really is 1200x630", () => {
  assert.equal(existsSync("public/social/og-default.png"), true);
  const header = readFileSync("public/social/og-default.png").subarray(16, 24);
  assert.equal(header.readUInt32BE(0), DEFAULT_OG_IMAGE.width);
  assert.equal(header.readUInt32BE(4), DEFAULT_OG_IMAGE.height);
});

test("product and guide pages no longer push non-1.91:1 art into summary_large_image", () => {
  for (const lang of LANGS) {
    for (const file of [
      `src/pages/${lang}/products/[slug].astro`,
      `src/pages/${lang}/products/[slug]/guide.astro`,
    ]) {
      assert.equal(passesOgImage(readFileSync(file, "utf8")), false, file);
    }
  }
});

test("negative proof: passing ogImage is detected", () => {
  const source = readFileSync("src/pages/en/products/[slug].astro", "utf8");
  const broken = source.replace(
    "  scene=",
    "  ogImage={data.proof.media?.src}\n  scene=",
  );
  assert.equal(passesOgImage(broken), true);
});

// --- sitemap --------------------------------------------------------------

test("footer-linked indexable /architecture/ routes are in the sitemap set", () => {
  for (const lang of LANGS) {
    const footer = getFooterLinks(lang).map((item) => item.href);
    assert.ok(footer.includes(`/${lang}/architecture/`), lang);
    assert.ok(PUBLIC_STATIC_PATHS.includes(`/${lang}/architecture/`), lang);
    const page = readFileSync(
      `src/pages/${lang}/architecture/index.astro`,
      "utf8",
    );
    assert.doesNotMatch(page, /noindex/);
  }
});

test("sitemap does not fabricate lastmod", () => {
  const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");
  assert.doesNotMatch(sitemap, /lastmod/);
});
