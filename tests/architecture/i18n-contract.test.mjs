import assert from "node:assert/strict";
import test from "node:test";

const {
  getLanguageFromPath,
  getAlternatePath,
  stripLanguagePrefix,
  SUPPORTED_LANGUAGES,
  LANGUAGES,
  PORTFOLIO_LANGUAGE_TARGETS,
  LANGUAGE_READINESS,
  resolveInitialLanguage,
} = await import("../../src/lib/i18n.ts");

test("getLanguageFromPath defaults to en and resolves every locale", () => {
  assert.equal(getLanguageFromPath("/about/"), "en");
  assert.equal(getLanguageFromPath("/en/about/"), "en");
  assert.equal(getLanguageFromPath("/vi/about/"), "vi");
  assert.equal(getLanguageFromPath("/zh/about/"), "zh");
});

test("getAlternatePath produces correct alternates across all locales", () => {
  assert.equal(getAlternatePath("/en/about/", "vi"), "/vi/about/");
  assert.equal(getAlternatePath("/vi/about/", "en"), "/en/about/");
  assert.equal(getAlternatePath("/en/about/", "zh"), "/zh/about/");
  assert.equal(getAlternatePath("/zh/about/", "en"), "/en/about/");
  assert.equal(getAlternatePath("/about/", "zh"), "/zh/about/");
});

test("stripLanguagePrefix removes prefix", () => {
  assert.equal(stripLanguagePrefix("/en/about/"), "/about/");
  assert.equal(stripLanguagePrefix("/vi/about/"), "/about/");
  assert.equal(stripLanguagePrefix("/zh/about/"), "/about/");
});

test("locale prefixes must end at a path-segment boundary", () => {
  // A longer name or an unlaunched script must not be mistaken for a live locale.
  for (const path of ["/english/", "/village/", "/zh-Hant/", "/zh-Hans/", "/enigma/"]) {
    assert.equal(stripLanguagePrefix(path), path, path);
    assert.equal(getLanguageFromPath(path), "en", path);
    assert.equal(getAlternatePath(path, "vi"), `/vi${path}`, path);
  }
  assert.equal(stripLanguagePrefix("/en"), "/");
  assert.equal(getAlternatePath("/en", "zh"), "/zh/");
});

test("SUPPORTED_LANGUAGES and LANGUAGES are consistent", () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "vi", "zh"]);
  assert.equal(LANGUAGES.en.hreflang, "en");
  assert.equal(LANGUAGES.vi.hreflang, "vi");
  assert.equal(LANGUAGES.zh.hreflang, "zh-Hans");
});

test("DEC-019 + C3-C W1: simplified Chinese is activated first-class; zh-Hant stays unactivated", () => {
  // ADR 0009 / C3-C W1 (approved) activates the runtime `zh` locale, so the
  // zh-Hans target is FIRST_CLASS. The fall-back zh-Hant target must remain
  // ARCHITECTURE_READY — no false runtime activation.
  assert.deepEqual(PORTFOLIO_LANGUAGE_TARGETS, [
    "en",
    "vi",
    "zh-Hans",
    "zh-Hant",
  ]);
  assert.equal(LANGUAGE_READINESS["zh-Hans"], "FIRST_CLASS");
  assert.equal(LANGUAGE_READINESS["zh-Hant"], "ARCHITECTURE_READY");
  assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "vi", "zh"]);
});

test("explicit saved choice outranks browser and country hints", () => {
  assert.equal(resolveInitialLanguage("en", ["vi-VN"], "VN"), "en");
  assert.equal(resolveInitialLanguage("vi", ["en-US"], "US"), "vi");
});

test("supported browser preference outranks coarse country hint", () => {
  assert.equal(resolveInitialLanguage(null, ["en-US"], "VN"), "en");
  assert.equal(resolveInitialLanguage(null, ["vi-VN"], "US"), "vi");
});

test("coarse country hint fills only the unresolved first-visit gap", () => {
  assert.equal(resolveInitialLanguage(null, ["fr-FR"], "VN"), "vi");
  assert.equal(resolveInitialLanguage(null, ["fr-FR"], "FR"), "en");
  assert.equal(resolveInitialLanguage(null, ["zh-Hant-TW"]), "en");
});
