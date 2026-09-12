import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function readPages() {
  const dir = "src/pages";
  const files = readdirSync(dir, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith(".astro"));
  return files.map((name) => readFileSync(join(dir, name), "utf8")).join("\n");
}

test("customer-facing pages ban internal path and env jargon", () => {
  const pages = readPages();
  const featured = readFileSync(
    "src/components/sections/FeaturedProducts.astro",
    "utf8",
  );
  const corpus = `${pages}\n${featured}`;
  assert.doesNotMatch(corpus, /docs\/evidence/);
  assert.doesNotMatch(corpus, /PUBLIC_CONTACT_EMAIL/);
  assert.doesNotMatch(corpus, /PUBLIC_SECURITY_EMAIL/);
  assert.doesNotMatch(corpus, /PUBLIC_SITE_URL/);
  assert.doesNotMatch(corpus, /this environment is configured/i);
  assert.doesNotMatch(corpus, /owner review/i);
  assert.doesNotMatch(corpus, /public inclusion gates/i);
  assert.doesNotMatch(corpus, /approved public truth/i);
});

test("muted text token meets WCAG AA on Porcelain", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  const match = css.match(/--text-muted:\s*(#[0-9a-fA-F]{6})/);
  assert.ok(match, "muted token hex required");
  const hex = match[1].toLowerCase();
  assert.notEqual(hex, "#64748b");

  const toRgb = (value) => [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]) =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const ratio = (fg, bg) => {
    const L1 = luminance(toRgb(fg));
    const L2 = luminance(toRgb(bg));
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  };
  assert.ok(
    ratio(hex, "#f7f8fa") >= 4.5,
    `muted ${hex} on Porcelain must be ≥4.5:1`,
  );
});

test("JSON-LD serialization escapes script breakouts", () => {
  const seo = readFileSync("src/lib/seo.ts", "utf8");
  const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
  assert.match(seo, /safeJsonLd/);
  assert.match(seo, /\\\\u003c/);
  assert.match(layout, /safeJsonLd\(/);
  assert.doesNotMatch(layout, /set:html=\{JSON\.stringify/);
});

test("product status chrome avoids universal pills and all-caps", () => {
  const status = readFileSync(
    "src/components/product/ProductStatus.astro",
    "utf8",
  );
  assert.doesNotMatch(status, /rounded-full/);
  assert.doesNotMatch(status, /\buppercase\b/);
  assert.match(status, /radius-card|rounded-\[/);
});

test("support empty state offers working trust paths without Contact loop", () => {
  const support = readFileSync("src/pages/support.astro", "utf8");
  assert.match(support, /SITE\.contactEmail/);
  assert.match(support, /href="\/security\/"/);
  assert.match(support, /href="\/about\/"/);
  assert.match(support, /hasBusinessEmail/);
});

test("privacy page summarizes practical trust answers", () => {
  const privacy = readFileSync("src/pages/privacy.astro", "utf8");
  assert.match(privacy, /What is collected/i);
  assert.match(privacy, /Why/i);
  assert.match(privacy, /How it is used/i);
  assert.match(privacy, /Deletion/i);
  assert.doesNotMatch(privacy, /tracking cookies are required/i);
  assert.match(privacy, /hasBusinessEmail/);
  assert.match(privacy, /href="\/security\/"/);
});

test("empty featured section is omitted instead of a hollow shelf", () => {
  const featured = readFileSync(
    "src/components/sections/FeaturedProducts.astro",
    "utf8",
  );
  const labels = readFileSync("src/data/site.ts", "utf8");
  assert.match(featured, /products\.length > 0/);
  assert.match(featured, /exploreAllProducts/);
  assert.match(labels, /Explore all products/);
  assert.doesNotMatch(featured, /No public products are published yet/);
});

test("404 page always requests noindex", () => {
  const en404 = readFileSync("src/pages/en/404.astro", "utf8");
  const vi404 = readFileSync("src/pages/vi/404.astro", "utf8");
  assert.match(en404, /noindex=\{?true\}?/);
  assert.match(vi404, /noindex=\{?true\}?/);
});

test("empty registry soft-lands via email-aware Act helper", () => {
  const act = readFileSync("src/lib/act.ts", "utf8");
  assert.match(act, /emptyRegistryPrimaryCta/);
  assert.match(act, /\/\/?about\//);
  assert.match(act, /\/\/?contact\//);
  assert.match(act, /\/\/?security\//);
  for (const path of [
    "src/components/sections/Hero.astro",
    "src/components/sections/NextStep.astro",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.match(
      source,
      /getPublicProducts|hasPublicProducts|products\.length/,
    );
    assert.match(source, /emptyRegistryPrimaryCta/);
  }
  const proofFirst = readFileSync(
    "src/components/product/ProofFirstEmptyState.astro",
    "utf8",
  );
  assert.match(proofFirst, /emptyRegistryPrimaryCta/);
  assert.match(proofFirst, /emptyRegistrySecondaryCta/);
  // The registry pages delegate the empty state to the proof-first component.
  for (const path of [
    "src/pages/en/products/index.astro",
    "src/pages/vi/products/index.astro",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /ProofFirstEmptyState/);
    assert.match(source, /getPublicProducts/);
  }
  const productsIndex = readFileSync(
    "src/pages/en/products/index.astro",
    "utf8",
  );
  assert.doesNotMatch(
    productsIndex,
    /Empty is preferred over invented maturity/i,
  );
});

test("UI muted token must not equal brand slate_500", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  const tokens = readFileSync(
    "public/brand/blueskyz/r4d/brand_tokens.json",
    "utf8",
  );
  const muted = css.match(/--text-muted:\s*(#[0-9a-fA-F]{6})/)?.[1];
  const slate500 = JSON.parse(tokens).colors?.slate_500;
  assert.ok(muted);
  assert.ok(slate500);
  assert.notEqual(muted.toLowerCase(), String(slate500).toLowerCase());
  assert.match(css, /Brand slate_500/);
});
