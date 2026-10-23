import assert from "node:assert/strict";
import { test } from "node:test";
import { getFooterLinks, getNav } from "../../src/data/site.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];

// Owner 2026-10-24 (O-05): Verify is a header primary-nav item in every
// locale, with the same label and route the footer already uses. Products
// stays first because the header CTA is nav[0].

for (const lang of LANGS) {
  test(`${lang}: the header nav carries Verify with the footer's label and route`, () => {
    const nav = getNav(lang);
    const verify = nav.find((item) => item.href === `/${lang}/verify/`);
    assert.ok(verify, `${lang} header nav has Verify`);
    const footer = getFooterLinks(lang).find(
      (item) => item.href === `/${lang}/verify/`,
    );
    assert.equal(verify.label, footer.label);
    assert.equal(nav[0].href, `/${lang}/products/`, "Products stays the CTA");
  });
}

test("negative proof: a nav without Verify is detected", () => {
  const without = getNav("en").filter(
    (item) => !item.href.includes("/verify/"),
  );
  assert.equal(
    without.some((item) => item.href === "/en/verify/"),
    false,
  );
  assert.notEqual(without.length, getNav("en").length);
});
