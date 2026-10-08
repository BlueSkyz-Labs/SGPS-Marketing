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
  isClaimReviewState,
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

test("ClaimReview only supports truth states with an actual review", () => {
  assert.equal(isClaimReviewState("reviewed"), true);
  assert.equal(isClaimReviewState("source-linked"), true);
  for (const state of ["public", "draft", "not-published", "unknown"]) {
    assert.equal(isClaimReviewState(state), false, state);
  }
});

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

// --- v8 W8: global SEO completion -------------------------------------------

import { execFileSync } from "node:child_process";
import {
  gitLastmod,
  LASTMOD_FLOOR,
  routeSourceFiles,
} from "../../src/lib/git-lastmod.ts";

// SEO-05: Simplified Chinese declares its script subtag.
const htmlLangOf = (src) => {
  const m = src.match(
    /const htmlLang =\s*currentLang === "zh-hant"\s*\?\s*"zh-Hant"\s*:\s*currentLang === "zh"\s*\?\s*"zh-Hans"\s*:\s*currentLang;/,
  );
  return m !== null;
};

test("layout tags /zh/ as zh-Hans and /zh-hant/ as zh-Hant", () => {
  assert.equal(htmlLangOf(layout), true);
});

test("negative proof: a layout that emits bare zh is rejected", () => {
  const broken = layout.replace('? "zh-Hans"', '? "zh"');
  assert.notEqual(broken, layout);
  assert.equal(htmlLangOf(broken), false);
});

test(":lang(zh) CSS selectors still match zh-Hans and zh-Hant (prefix match)", () => {
  // `:lang(zh)` is a BCP-47 extended-range prefix match, so both script
  // subtags keep the CJK display-type rules; no selector pins `lang="zh"`.
  const css = readFileSync("src/styles/display-type.css", "utf8");
  assert.match(css, /:lang\(zh\)/);
  assert.doesNotMatch(css, /\[lang=["']?zh["']?\]/);
});

// SEO-06: og:locale:alternate lists all 3 other locales.
test("og:locale:alternate is every locale except the current one", () => {
  assert.match(layout, /Object\.values\(OG_LOCALES\)\.filter\(/);
  assert.match(layout, /\(locale\) => locale !== ogLocale/);
  assert.match(layout, /property="og:locale:alternate"/);
  const map = {
    en: "en_US",
    vi: "vi_VN",
    zh: "zh_CN",
    "zh-hant": "zh_TW",
  };
  for (const lang of LANGS) {
    const alts = Object.values(map).filter((l) => l !== map[lang]);
    assert.equal(alts.length, 3);
    assert.equal(new Set(alts).size, 3);
    assert.equal(alts.includes(map[lang]), false);
  }
});

test("negative proof: an alternate filter that keeps the current locale is detected", () => {
  const broken = layout.replace(
    /\(locale\) => locale !== ogLocale/,
    "() => true",
  );
  assert.notEqual(broken, layout);
  assert.doesNotMatch(broken, /\(locale\) => locale !== ogLocale/);
});

// SEO-12/21: noindex 404 pages carry no hreflang and no site-level JSON-LD.
const guards404 = (src) =>
  /const isNotFoundPage = \/\\\/404\\\/\?\$\/\.test\(path\)/.test(src) &&
  /isNotFoundPage\s*\?\s*\[\]\s*:\s*\[\s*organizationJsonLd/.test(src) &&
  /if\s*\(!isNotFoundPage\)\s*\{[\s\S]*?for\s*\(const node of extraJsonLd\)\s*structuredData\.push\(node\);[\s\S]*?\}/.test(
    src,
  ) &&
  /\{isNotFoundPage\s*\?\s*null\s*:\s*hreflangLinks/.test(src) &&
  /\{isNotFoundPage \? null : \(\s*<link\s+rel="alternate"\s+hreflang="x-default"/.test(
    src,
  );

test("404 pages drop hreflang, x-default and Organization/WebSite JSON-LD", () => {
  assert.equal(guards404(layout), true);
  for (const file of [
    "src/pages/404.astro",
    "src/pages/en/404.astro",
    "src/pages/vi/404.astro",
    "src/pages/zh/404.astro",
    "src/pages/zh-hant/404.astro",
  ]) {
    const src = readFileSync(file, "utf8");
    assert.match(src, /noindex=\{true\}/, file);
    const p = src.match(/path="([^"]+)"/)[1];
    assert.match(p, /\/404\/$/, file);
  }
});

test("negative proof: restoring site JSON-LD on 404 is rejected", () => {
  const broken = layout.replace(
    /isNotFoundPage\s*\?\s*\[\]\s*:\s*\[\s*organizationJsonLd/,
    "[organizationJsonLd",
  );
  assert.notEqual(broken, layout);
  assert.equal(guards404(broken), false);
});

test("negative proof: appending page JSON-LD to a 404 is rejected", () => {
  const broken = layout.replace("if (!isNotFoundPage) {", "if (true) {");
  assert.notEqual(broken, layout);
  assert.equal(guards404(broken), false);
});

// SEO-10: sitemap lastmod is git-derived, omitted when inaccurate.
const fakeGit = (shallow, date) => (args) => {
  if (args[0] === "rev-parse") return shallow;
  return date;
};
const OPTS = { today: "2026-10-01" };

test("gitLastmod returns the git date for a full clone", () => {
  assert.equal(
    gitLastmod(["a"], { ...OPTS, run: fakeGit("false", "2026-09-15") }),
    "2026-09-15",
  );
});

test("gitLastmod omits lastmod for a shallow clone, future/ancient dates, errors and no files", () => {
  assert.equal(
    gitLastmod(["a"], { ...OPTS, run: fakeGit("true", "2026-09-15") }),
    undefined,
  );
  assert.equal(
    gitLastmod(["a"], { ...OPTS, run: fakeGit("false", "2026-10-02") }),
    undefined,
  );
  assert.equal(
    gitLastmod(["a"], { ...OPTS, run: fakeGit("false", "2026-07-31") }),
    undefined,
  );
  assert.equal(
    gitLastmod(["a"], { ...OPTS, run: fakeGit("false", "") }),
    undefined,
  );
  assert.equal(
    gitLastmod(["a"], {
      ...OPTS,
      run: () => {
        throw new Error("no git");
      },
    }),
    undefined,
  );
  assert.equal(
    gitLastmod([], { ...OPTS, run: fakeGit("false", "2026-09-15") }),
    undefined,
  );
});

test("negative proof: a build-time fallback would be caught", () => {
  // If the implementation fell back to "today" on a shallow clone this would
  // return a date instead of undefined.
  const v = gitLastmod(["a"], { ...OPTS, run: fakeGit("true", "2026-09-15") });
  assert.notEqual(v, OPTS.today);
  assert.equal(v, undefined);
});

test("routeSourceFiles maps routes to real tracked sources", () => {
  assert.deepEqual(routeSourceFiles("/"), ["src/pages/index.astro"]);
  assert.deepEqual(routeSourceFiles("/zh/about/"), [
    "src/pages/zh/about.astro",
  ]);
  assert.deepEqual(routeSourceFiles("/en/dossier/"), [
    "src/pages/en/dossier/index.astro",
  ]);
  assert.ok(
    routeSourceFiles("/vi/products/sotro/").includes(
      "src/content/products/sotro.yaml",
    ),
  );
  assert.deepEqual(routeSourceFiles("/en/no-such-page/"), []);
});

test("real git lastmod for every sitemap static path is absent or within [floor, today]", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const path of PUBLIC_STATIC_PATHS.filter((p) => !isNoindexPath(p))) {
    const d = gitLastmod(routeSourceFiles(path));
    if (d === undefined) continue;
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/, path);
    assert.ok(d >= LASTMOD_FLOOR && d <= today, `${path}: ${d}`);
  }
  // Sanity: git is usable here, so a full clone yields at least one date.
  const shallow = execFileSync(
    "git",
    ["rev-parse", "--is-shallow-repository"],
    {
      encoding: "utf8",
    },
  ).trim();
  if (shallow === "false") {
    assert.ok(gitLastmod(routeSourceFiles("/en/about/")) !== undefined);
  }
});

test("sitemap source emits lastmod only through the git helper", () => {
  assert.match(sitemap, /lastmodForPath\(path\)/);
  assert.match(sitemap, /lastmod \? \[/);
  assert.doesNotMatch(sitemap, /new Date|Date\.now/);
});
