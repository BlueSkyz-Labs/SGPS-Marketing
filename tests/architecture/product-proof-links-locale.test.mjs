import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/*
 * Red-team finding RT-04 (2026-10-03): product pages rendered the registry's
 * absolute English proof URLs (https://blueskyzlabs.com/en/privacy/ ...) under
 * localized labels, sending a Vietnamese or Chinese reader to English pages
 * and, before go-live, through the gated apex host. Links back into this site
 * must stay on the reader's locale and be origin-relative.
 */

const LOCALES = ["en", "vi", "zh", "zh-hant"];

export function crossLocaleSiteLinks(html, lang) {
  const bad = [];
  for (const match of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    if (/^https:\/\/blueskyzlabs\.com\//.test(href)) bad.push(href);
    const local = href.match(/^\/(en|vi|zh-hant|zh)\//);
    if (local && local[1] !== lang) bad.push(href);
  }
  return bad;
}

test("product pages keep proof links on the reader's locale and origin", () => {
  if (!existsSync("dist")) return; // architecture tests may run before build
  for (const lang of LOCALES) {
    const dir = join("dist", lang, "products");
    for (const slug of readdirSync(dir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const file = join(dir, slug.name, "index.html");
      if (!existsSync(file)) continue;
      const html = readFileSync(file, "utf8");
      const proof =
        html.match(/<a\s[^>]*href="[^"]*\/(privacy|security|support)\/"/g) ??
        [];
      for (const anchor of proof) {
        const href = anchor.match(/href="([^"]+)"/)[1];
        assert.equal(
          href,
          `/${lang}/${href.split("/").at(-2)}/`,
          `${file}: ${href}`,
        );
      }
    }
  }
});

test("negative proof: an absolute or foreign-locale site link is detected", () => {
  assert.deepEqual(
    crossLocaleSiteLinks(
      '<a href="https://blueskyzlabs.com/en/privacy/">x</a>',
      "vi",
    ),
    ["https://blueskyzlabs.com/en/privacy/"],
  );
  assert.deepEqual(crossLocaleSiteLinks('<a href="/en/support/">x</a>', "vi"), [
    "/en/support/",
  ]);
  assert.deepEqual(
    crossLocaleSiteLinks('<a href="/vi/support/">x</a>', "vi"),
    [],
  );
  assert.deepEqual(
    crossLocaleSiteLinks('<a href="/zh-hant/privacy/">x</a>', "zh-hant"),
    [],
  );
  assert.deepEqual(
    crossLocaleSiteLinks(
      '<a href="https://sotro.blueskyzlabs.com/login">x</a>',
      "vi",
    ),
    [],
  );
});
