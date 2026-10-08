/**
 * v12 S2 — structured data, titles/descriptions and heading outline.
 *
 * Source half (always runs): JSON-LD builders fed with each public registry
 * record must reproduce that record and nothing else; authored titles and
 * descriptions are unique per locale and short enough for a result page.
 * Built half (runs when dist/ exists; the local gate builds first, and CI
 * repeats it on served pages in tests/e2e/seo-v12-routes.spec.ts): every page
 * has exactly one h1, valid JSON-LD of the expected types, no fabricated
 * product ratings or prices, and per-locale unique titles and descriptions.
 * Every predicate has a negative proof below.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  GUIDE_META,
  PAGE_META,
  PRODUCT_META,
} from "../../src/data/page-meta.ts";
import { SITE } from "../../src/data/site.ts";
import { productBreadcrumbJsonLd } from "../../src/lib/breadcrumbs.ts";
import {
  organizationJsonLd,
  organizationId,
  claimReviewJsonLd,
  productJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "../../src/lib/seo.ts";
import {
  appRegistryProblems,
  builtPageProblems,
  duplicates,
  isRealPage,
  forbiddenKeyPaths,
  jsonLdProblems,
  pageFacts,
  registryFacts,
} from "./lib/seo-html.mjs";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const BASE = "https://blueskyzlabs.com";
const PRODUCTS_DIR = "src/content/products";

const publicRecords = readdirSync(PRODUCTS_DIR)
  .filter((file) => file.endsWith(".yaml"))
  .map((file) => readFileSync(join(PRODUCTS_DIR, file), "utf8"))
  .filter((yaml) => /^public: true$/m.test(yaml))
  .map((yaml) => ({ yaml, facts: registryFacts(yaml) }));

/** Builds the node exactly as the product pages do, from registry fields only. */
const appFor = (facts, lang) =>
  productJsonLd(
    {
      name: facts.name,
      description: facts.shortDescription[lang] ?? facts.shortDescription.en,
      slug: facts.slug,
      platforms: facts.platforms,
      ...(facts.applicationCategory
        ? { applicationCategory: facts.applicationCategory }
        : {}),
    },
    BASE,
    lang,
  );

// --- JSON-LD from the registry ----------------------------------------------

test("at least one public registry record is checked", () => {
  assert.ok(publicRecords.length >= 1);
  for (const { facts } of publicRecords) {
    assert.ok(facts.slug && facts.name && facts.shortDescription.en);
  }
});

test("SoftwareApplication is rebuilt from registry fields only, in every locale", () => {
  for (const { facts } of publicRecords) {
    for (const lang of LANGS) {
      const app = appFor(facts, lang);
      assert.deepEqual(appRegistryProblems(app, facts, lang), [], facts.slug);
      assert.deepEqual(jsonLdProblems(app), [], `${facts.slug}/${lang}`);
    }
  }
});

test("Sổ Trọ declares its category in the record and the node carries it", () => {
  const sotro = publicRecords.find(({ facts }) => facts.slug === "sotro");
  assert.ok(sotro, "sotro is a public record");
  assert.equal(sotro.facts.applicationCategory, "BusinessApplication");
  for (const lang of LANGS) {
    assert.equal(
      appFor(sotro.facts, lang).applicationCategory,
      "BusinessApplication",
      lang,
    );
  }
});

test("product pages pass registry fields, never literals, to the builder", () => {
  const callsWithRegistryFields = (src) =>
    /productJsonLd\(\s*\{\s*name: data\.name,\s*description: copy\.shortDescription,\s*slug: data\.slug,/.test(
      src,
    ) &&
    /platforms: data\.platforms,/.test(src) &&
    /\.\.\.\(data\.applicationCategory\s*\?\s*\{ applicationCategory: data\.applicationCategory \}\s*:\s*\{\}\)/.test(
      src,
    );
  for (const lang of LANGS) {
    const src = readFileSync(`src/pages/${lang}/products/[slug].astro`, "utf8");
    assert.equal(callsWithRegistryFields(src), true, lang);
  }
  // negative proof: an authored description is rejected
  const en = readFileSync("src/pages/en/products/[slug].astro", "utf8");
  assert.equal(
    callsWithRegistryFields(
      en.replace(
        "description: copy.shortDescription,",
        'description: "The best landlord app",',
      ),
    ),
    false,
  );
  // negative proof: a literal category instead of the record field is rejected
  assert.equal(
    callsWithRegistryFields(
      en.replace(
        /\.\.\.\(data\.applicationCategory[\s\S]*?: \{\}\),/,
        'applicationCategory: "BusinessApplication",',
      ),
    ),
    false,
  );
});

test("site-wide Organization and WebSite are valid and share one Organization id", () => {
  const org = organizationJsonLd(BASE);
  const site = websiteJsonLd(BASE);
  assert.deepEqual(jsonLdProblems(org), []);
  assert.deepEqual(jsonLdProblems(site), []);
  assert.equal(org["@id"], `${BASE}/#organization`);
  assert.equal(site.publisher["@id"], organizationId(BASE));
  for (const { facts } of publicRecords) {
    assert.equal(appFor(facts, "en").publisher["@id"], org["@id"]);
    assert.equal(appFor(facts, "en").publisher.url, org.url);
  }
});

test("WebPage and ClaimReview nodes stay complete and carry no numeric rating", () => {
  const page = webPageJsonLd(
    BASE,
    "/en/about/",
    "About BlueSkyz Labs",
    "Company facts and products.",
    "en",
  );
  assert.deepEqual(jsonLdProblems(page), []);

  const review = claimReviewJsonLd(BASE, "/en/evidence/example/", {
    claimText: "The site sets no cookies.",
    lang: "en",
    stateLabel: "Source linked",
  });
  assert.deepEqual(jsonLdProblems(review), []);
  assert.deepEqual(forbiddenKeyPaths(review), []);

  const numeric = {
    ...review,
    reviewRating: { ...review.reviewRating, ratingValue: 5 },
  };
  assert.ok(jsonLdProblems(numeric).some((p) => p.includes("reviewRating")));
  assert.ok(forbiddenKeyPaths(numeric).some((p) => p.endsWith("ratingValue")));
});

test("product BreadcrumbList is valid in every locale", () => {
  for (const { facts } of publicRecords) {
    for (const lang of LANGS) {
      const crumbs = productBreadcrumbJsonLd(
        lang,
        facts.slug,
        facts.name,
        BASE,
      );
      assert.ok(crumbs, `${facts.slug}/${lang}`);
      assert.deepEqual(jsonLdProblems(crumbs), [], `${facts.slug}/${lang}`);
    }
  }
});

test("negative proof: rating, review and price keys are rejected", () => {
  const app = appFor(publicRecords[0].facts, "en");
  for (const extra of [
    { aggregateRating: { "@type": "AggregateRating", ratingValue: 5 } },
    { review: [{ "@type": "Review", reviewBody: "Great" }] },
    { offers: { "@type": "Offer", price: "0", priceCurrency: "VND" } },
  ]) {
    const node = { ...app, ...extra };
    assert.notDeepEqual(forbiddenKeyPaths(node), []);
    assert.ok(
      jsonLdProblems(node).some((p) => p.startsWith("forbidden key")),
      Object.keys(extra)[0],
    );
    assert.ok(
      appRegistryProblems(node, publicRecords[0].facts, "en").some((p) =>
        p.startsWith("non-registry key"),
      ),
    );
  }
  // nested too
  assert.deepEqual(forbiddenKeyPaths({ a: [{ b: { price: 1 } }] }), [
    "$.a[0].b.price",
  ]);
});

test("negative proof: a node that departs from its record is rejected", () => {
  const { facts } = publicRecords[0];
  const app = appFor(facts, "vi");
  assert.notDeepEqual(
    appRegistryProblems({ ...app, name: `${facts.name} Pro` }, facts, "vi"),
    [],
  );
  assert.notDeepEqual(
    appRegistryProblems({ ...app, operatingSystem: "Windows" }, facts, "vi"),
    [],
  );
  // A category the record does not declare, a different one, or a dropped one.
  assert.notDeepEqual(
    appRegistryProblems(
      { ...app, applicationCategory: "BusinessApplication" },
      { ...facts, applicationCategory: undefined },
      "vi",
    ),
    [],
  );
  assert.notDeepEqual(
    appRegistryProblems(
      { ...app, applicationCategory: "GameApplication" },
      facts,
      "vi",
    ),
    [],
  );
  const uncategorized = { ...app };
  delete uncategorized.applicationCategory;
  assert.notDeepEqual(
    appRegistryProblems(
      uncategorized,
      { ...facts, applicationCategory: "BusinessApplication" },
      "vi",
    ),
    [],
  );
  assert.notDeepEqual(appRegistryProblems(app, facts, "en"), []);
  assert.notDeepEqual(jsonLdProblems({ ...app, "@type": "Product" }), []);
  assert.notDeepEqual(jsonLdProblems({ ...app, "@context": "http://x" }), []);
});

// --- authored titles and descriptions ----------------------------------------

const composeTitle = (title) =>
  title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
const TITLE_MAX = 60;
const titleTooLong = (title) => [...composeTitle(title)].length > TITLE_MAX;

function authoredRows(lang) {
  return [
    ...Object.entries(PAGE_META[lang]).map(([key, meta]) => ({
      route: key,
      ...meta,
    })),
    ...Object.entries(PRODUCT_META).map(([slug, byLang]) => ({
      route: `product/${slug}`,
      ...byLang[lang],
    })),
    ...Object.entries(GUIDE_META).map(([slug, byLang]) => ({
      route: `guide/${slug}`,
      ...byLang[lang],
    })),
  ];
}

test("authored titles and descriptions are unique within each locale", () => {
  for (const lang of LANGS) {
    const rows = authoredRows(lang);
    assert.deepEqual(duplicates(rows, "title"), {}, `${lang} titles`);
    assert.deepEqual(duplicates(rows, "description"), {}, `${lang} descs`);
  }
});

test(`authored titles stay within ${TITLE_MAX} characters with the brand`, () => {
  for (const lang of LANGS) {
    for (const row of authoredRows(lang)) {
      assert.equal(
        titleTooLong(row.title),
        false,
        `${lang}/${row.route}: ${composeTitle(row.title)}`,
      );
    }
  }
});

test("negative proof: a duplicate or an over-long title is rejected", () => {
  const rows = authoredRows("en");
  const dup = [...rows, { ...rows[1], route: "copy" }];
  assert.notDeepEqual(duplicates(dup, "title"), {});
  assert.notDeepEqual(duplicates(dup, "description"), {});
  assert.equal(titleTooLong("x".repeat(TITLE_MAX - 15)), true);
  assert.equal(titleTooLong("x".repeat(TITLE_MAX - 16)), false);
});

// --- built output ------------------------------------------------------------

function builtPages(root = "dist") {
  const files = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".html")) files.push(path);
    }
  })(root);
  return files.map((file) => {
    const route = `/${file.slice(root.length + 1)}`
      .replace(/index\.html$/, "")
      .replace(/\\/g, "/");
    return { route, ...pageFacts(readFileSync(file, "utf8")) };
  });
}

const builtProblems = (pages) => builtPageProblems(pages, publicRecords);

const distReady = existsSync("dist/en/index.html");
const skipBuilt = distReady
  ? false
  : "dist/ absent: run after `pnpm build` (CI: tests/e2e/seo-v12-routes.spec.ts)";

test(
  "built pages: one h1, valid registry-bound JSON-LD, unique titles/descriptions",
  {
    skip: skipBuilt,
  },
  () => {
    const pages = builtPages();
    assert.ok(pages.filter(isRealPage).length >= 80, "scanned page count");
    assert.deepEqual(builtProblems(pages), []);
  },
);

test(
  "negative proof: the built-page scan rejects each broken invariant",
  {
    skip: skipBuilt,
  },
  () => {
    const pages = builtPages();
    const sotro = pages.find((p) => p.route === "/en/products/sotro/");
    const about = pages.find((p) => p.route === "/en/about/");
    assert.ok(sotro && about);
    const withApp = (mutate) =>
      sotro.jsonLd.map((block) =>
        block.data?.["@type"] === "SoftwareApplication"
          ? { ok: true, data: mutate({ ...block.data }) }
          : block,
      );
    const cases = {
      "two h1": [{ ...about, h1Count: 2 }],
      "no h1": [{ ...about, h1Count: 0 }],
      "duplicate title": [about, { ...about, route: "/en/about-copy/" }],
      rating: [
        {
          ...sotro,
          jsonLd: withApp((d) => ({
            ...d,
            aggregateRating: { "@type": "AggregateRating", ratingValue: 5 },
          })),
        },
      ],
      "invented description": [
        {
          ...sotro,
          jsonLd: withApp((d) => ({ ...d, description: "Best app" })),
        },
      ],
      "unparseable JSON-LD": [
        { ...about, jsonLd: [...about.jsonLd, { ok: false, error: "x" }] },
      ],
      "missing SoftwareApplication": [
        {
          ...sotro,
          jsonLd: sotro.jsonLd.filter(
            (b) => b.data?.["@type"] !== "SoftwareApplication",
          ),
        },
      ],
    };
    for (const [name, broken] of Object.entries(cases)) {
      assert.notDeepEqual(builtProblems(broken), [], name);
    }
    assert.deepEqual(builtProblems([about]), [], "control");
  },
);
