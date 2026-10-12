/**
 * v5 W5.1 — per-product Open Graph image.
 *
 * Every published product profile page (all four locales) names its own
 * 1200x630 JPEG card (<= 150 KB) that exists in dist/; hidden products have
 * no card and no profile page; non-product pages keep the site-wide default.
 * Source half always runs; built half runs when dist/ exists (the local gate
 * builds first). Every predicate has a negative proof below.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";

import {
  PRODUCT_OG_MAX_BYTES,
  PRODUCT_OG_SIZE,
  productOgImageAlt,
  productOgImagePath,
} from "../../src/lib/product-og.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const PRODUCTS_DIR = "src/content/products";
const records = readdirSync(PRODUCTS_DIR)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => {
    const src = readFileSync(join(PRODUCTS_DIR, f), "utf8");
    return {
      slug: f.replace(/\.yaml$/, ""),
      name: src.match(/^name:\s*(.+)\s*$/m)[1].trim(),
      public: /^public:\s*true\s*$/m.test(src),
    };
  });
const published = records.filter((r) => r.public);
const hidden = records.filter((r) => !r.public);

const meta = (html, key) =>
  html.match(
    new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`),
  )?.[1];

/** Pure predicate: problems for one built product page, given the card facts. */
export function productPageOgProblems({ html, slug, card }) {
  const problems = [];
  const expected = `/social/products/${slug}.jpg`;
  for (const key of ["og:image", "twitter:image"]) {
    const value = meta(html, key);
    if (!value || new URL(value).pathname !== expected)
      problems.push(`${key} is ${value ?? "missing"}, expected ${expected}`);
  }
  if (meta(html, "og:image:width") !== "1200") problems.push("og:image:width");
  if (meta(html, "og:image:height") !== "630") problems.push("og:image:height");
  if (!meta(html, "og:image:alt")) problems.push("og:image:alt missing");
  if (!meta(html, "twitter:image:alt")) problems.push("twitter:image:alt");
  if (!card) problems.push("card file missing from dist");
  else {
    if (card.width !== 1200 || card.height !== 630)
      problems.push(`card is ${card.width}x${card.height}`);
    if (card.bytes > PRODUCT_OG_MAX_BYTES)
      problems.push(`card is ${card.bytes} bytes`);
    if (card.format !== "jpeg") problems.push(`card format ${card.format}`);
  }
  return problems;
}

test("source: card path, size and localized alt come from existing copy", () => {
  assert.deepEqual(PRODUCT_OG_SIZE, { width: 1200, height: 630 });
  assert.equal(productOgImagePath("sotro"), "/social/products/sotro.jpg");
  const alts = LANGS.map((l) => productOgImageAlt("Sổ Trọ", l));
  assert.equal(new Set(alts).size, 4, "alt is localized per locale");
  for (const alt of alts) assert.ok(alt.startsWith("Sổ Trọ — "));
  assert.ok(published.length >= 1);
});

test("negative proof: the predicate rejects each broken invariant", () => {
  const good = `<meta property="og:image" content="https://x.test/social/products/a.jpg"><meta name="twitter:image" content="https://x.test/social/products/a.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="a"><meta name="twitter:image:alt" content="a">`;
  const card = { width: 1200, height: 630, bytes: 1000, format: "jpeg" };
  assert.deepEqual(productPageOgProblems({ html: good, slug: "a", card }), []);
  const bad = (html, c = card) =>
    productPageOgProblems({ html, slug: "a", card: c }).length > 0;
  assert.ok(bad(good.replace(/a\.jpg/g, "og-default.png")), "default image");
  assert.ok(bad(good.replace('width" content="1200', 'width" content="1')));
  assert.ok(bad(good.replace(/<meta property="og:image:alt"[^>]*>/, "")));
  assert.ok(bad(good, null), "missing file");
  assert.ok(bad(good, { ...card, width: 600 }), "wrong dimensions");
  assert.ok(bad(good, { ...card, bytes: PRODUCT_OG_MAX_BYTES + 1 }), "size");
  assert.ok(bad(good, { ...card, format: "png" }), "format");
});

test("built: published product pages carry their own card; hidden get none", async (t) => {
  if (!existsSync("dist")) return t.skip("dist/ not built");
  for (const { slug } of published) {
    const file = `dist/social/products/${slug}.jpg`;
    const card = existsSync(file)
      ? {
          ...(await sharp(file).metadata()),
          bytes: statSync(file).size,
        }
      : null;
    for (const lang of LANGS) {
      const html = readFileSync(
        `dist/${lang}/products/${slug}/index.html`,
        "utf8",
      );
      assert.deepEqual(
        productPageOgProblems({ html, slug, card }),
        [],
        `${lang}/${slug}`,
      );
    }
  }
  const emitted = readdirSync("dist/social/products").sort();
  assert.deepEqual(
    emitted,
    published.map((r) => `${r.slug}.jpg`).sort(),
    "exactly the published products have a card",
  );
  for (const { slug, name } of hidden) {
    assert.ok(!existsSync(`dist/social/products/${slug}.jpg`), slug);
    for (const lang of LANGS)
      assert.ok(
        !existsSync(`dist/${lang}/products/${slug}`),
        `${lang}/${slug}`,
      );
    assert.ok(name);
  }
});

test("built: non-product pages keep the site-wide default card", (t) => {
  if (!existsSync("dist")) return t.skip("dist/ not built");
  for (const rel of [
    "index.html",
    ...LANGS.map((l) => `${l}/products/index.html`),
  ]) {
    const html = readFileSync(`dist/${rel}`, "utf8");
    assert.match(meta(html, "og:image"), /\/social\/og-default\.png$/, rel);
  }
});

test("built: a card is byte-identical to a fresh render (determinism)", async (t) => {
  if (!existsSync("dist")) return t.skip("dist/ not built");
  const { renderProductOgImage } = await import("../../src/lib/product-og.ts");
  for (const { slug } of published) {
    const fresh = await renderProductOgImage(slug);
    assert.ok(
      fresh.equals(readFileSync(`dist/social/products/${slug}.jpg`)),
      slug,
    );
  }
});
