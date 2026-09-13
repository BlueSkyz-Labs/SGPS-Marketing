/**
 * H3 — breadcrumb contract.
 * Breadcrumbs must never invent a page name: every crumb either mirrors a
 * declared label (footer/nav data, or a string the page already renders) or the
 * page gets no breadcrumb at all.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  breadcrumbJsonLd,
  getBreadcrumbTrail,
} from "../../src/lib/breadcrumbs.ts";
import { getFooterLinks, SITE } from "../../src/data/site.ts";

const LANGS = ["en", "vi"];

test("home pages carry no breadcrumb", () => {
  for (const lang of LANGS) {
    assert.deepEqual(getBreadcrumbTrail(lang, `/${lang}/`), []);
    assert.equal(breadcrumbJsonLd(lang, `/${lang}/`, SITE.url), null);
  }
});

test("declared public routes get a home + page trail", () => {
  const decorated = [
    "products",
    "about",
    "contact",
    "support",
    "privacy",
    "security",
    "decision-room",
  ];
  for (const lang of LANGS) {
    for (const segment of decorated) {
      const trail = getBreadcrumbTrail(lang, `/${lang}/${segment}/`);
      assert.equal(trail.length, 2, `${lang}/${segment} trail length`);
      assert.equal(trail[0].path, `/${lang}/`);
      assert.equal(trail[1].path, `/${lang}/${segment}/`);
    }
  }
});

test("crumb names come from declared data, never free text", () => {
  for (const lang of LANGS) {
    const declared = new Set(getFooterLinks(lang).map((item) => item.label));
    for (const item of getFooterLinks(lang)) {
      const trail = getBreadcrumbTrail(lang, item.href);
      assert.ok(
        declared.has(trail[1].name),
        `${item.href} breadcrumb must reuse the declared label`,
      );
    }
  }
});

test("routes without a declared label fail closed", () => {
  for (const lang of LANGS) {
    assert.deepEqual(getBreadcrumbTrail(lang, `/${lang}/does-not-exist/`), []);
    assert.deepEqual(
      getBreadcrumbTrail("en", "/vi/about/"),
      [],
      "cross-locale path",
    );
  }
});

test("evidence passports reuse the declared artifact label", () => {
  const trail = getBreadcrumbTrail("en", "/en/evidence/trust-you-can-verify/");
  assert.equal(trail.length, 2);
  assert.equal(trail[1].name, "Evidence passport");
});

test("JSON-LD is a well-formed BreadcrumbList with canonical URLs", () => {
  const json = breadcrumbJsonLd("vi", "/vi/privacy/", SITE.url);
  assert.ok(json);
  assert.equal(json["@type"], "BreadcrumbList");
  assert.equal(json.itemListElement.length, 2);
  json.itemListElement.forEach((entry, index) => {
    assert.equal(entry.position, index + 1);
    assert.ok(
      entry.item.startsWith(SITE.url.replace(/\/+$/, "")),
      `item must be canonical: ${entry.item}`,
    );
    assert.ok(entry.name.length > 0);
  });
});

test("locale parity: both locales decorate the same route set", () => {
  const decoratedFor = (lang) =>
    [
      "products",
      "about",
      "contact",
      "support",
      "privacy",
      "security",
      "decision-room",
    ]
      .filter(
        (segment) =>
          getBreadcrumbTrail(lang, `/${lang}/${segment}/`).length > 0,
      )
      .join(",");
  assert.equal(decoratedFor("en"), decoratedFor("vi"));
});
