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
  assert.equal(getLanguageFromPath("/zh-hant/about/"), "zh-hant");
});

test("getAlternatePath produces correct alternates across all locales", () => {
  assert.equal(getAlternatePath("/en/about/", "vi"), "/vi/about/");
  assert.equal(getAlternatePath("/vi/about/", "en"), "/en/about/");
  assert.equal(getAlternatePath("/en/about/", "zh"), "/zh/about/");
  assert.equal(getAlternatePath("/zh/about/", "en"), "/en/about/");
  assert.equal(getAlternatePath("/about/", "zh"), "/zh/about/");
  assert.equal(getAlternatePath("/zh/about/", "zh-hant"), "/zh-hant/about/");
  assert.equal(getAlternatePath("/zh-hant/about/", "zh"), "/zh/about/");
  assert.equal(getAlternatePath("/zh-hant/about/", "en"), "/en/about/");
});

test("stripLanguagePrefix removes prefix", () => {
  assert.equal(stripLanguagePrefix("/en/about/"), "/about/");
  assert.equal(stripLanguagePrefix("/vi/about/"), "/about/");
  assert.equal(stripLanguagePrefix("/zh/about/"), "/about/");
  assert.equal(stripLanguagePrefix("/zh-hant/about/"), "/about/");
});

test("locale prefixes must end at a path-segment boundary", () => {
  // A longer name or an unlaunched script must not be mistaken for a live locale.
  // Locale segments are lowercase: `/zh-Hant/` is not the live `/zh-hant/`.
  for (const path of [
    "/english/",
    "/village/",
    "/zh-Hant/",
    "/zh-Hans/",
    "/zh-hans/",
    "/zh-hantx/",
    "/enigma/",
  ]) {
    assert.equal(stripLanguagePrefix(path), path, path);
    assert.equal(getLanguageFromPath(path), "en", path);
    assert.equal(getAlternatePath(path, "vi"), `/vi${path}`, path);
  }
  assert.equal(stripLanguagePrefix("/en"), "/");
  assert.equal(getAlternatePath("/en", "zh"), "/zh/");
  assert.equal(stripLanguagePrefix("/zh-hant"), "/");
  assert.equal(getAlternatePath("/zh-hant", "en"), "/en/");
});

test("SUPPORTED_LANGUAGES and LANGUAGES are consistent", () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "vi", "zh", "zh-hant"]);
  assert.equal(LANGUAGES.en.hreflang, "en");
  assert.equal(LANGUAGES.vi.hreflang, "vi");
  assert.equal(LANGUAGES.zh.hreflang, "zh-Hans");
  assert.equal(LANGUAGES["zh-hant"].hreflang, "zh-Hant");
  assert.deepEqual(
    SUPPORTED_LANGUAGES.map((lang) => LANGUAGES[lang].label),
    ["English", "Tiếng Việt", "简体中文", "繁體中文"],
  );
  assert.deepEqual(
    SUPPORTED_LANGUAGES.map((lang) => LANGUAGES[lang].shortLabel),
    ["EN", "VI", "简", "繁"],
  );
  for (const lang of SUPPORTED_LANGUAGES) {
    assert.equal(LANGUAGES[lang].code, lang);
  }
});

test("DEC-019 + C3-C W1: both Chinese scripts are activated first-class", () => {
  // ADR 0009 / C3-C W1 (approved) activated the runtime `zh` locale (zh-Hans).
  // The runtime `zh-hant` locale (URL /zh-hant/, hreflang zh-Hant) is now
  // FIRST_CLASS too, so readiness and the runtime set must agree.
  assert.deepEqual(PORTFOLIO_LANGUAGE_TARGETS, [
    "en",
    "vi",
    "zh-Hans",
    "zh-Hant",
  ]);
  assert.equal(LANGUAGE_READINESS["zh-Hans"], "FIRST_CLASS");
  assert.equal(LANGUAGE_READINESS["zh-Hant"], "FIRST_CLASS");
  assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "vi", "zh", "zh-hant"]);
  for (const target of PORTFOLIO_LANGUAGE_TARGETS) {
    const runtime = SUPPORTED_LANGUAGES.filter(
      (lang) => LANGUAGES[lang].hreflang === target,
    );
    assert.equal(
      runtime.length === 1,
      LANGUAGE_READINESS[target] === "FIRST_CLASS",
      `${target}: FIRST_CLASS must have exactly one runtime locale`,
    );
  }
});

test("explicit saved choice outranks browser and country hints", () => {
  assert.equal(resolveInitialLanguage("en", ["vi-VN"], "VN"), "en");
  assert.equal(resolveInitialLanguage("vi", ["en-US"], "US"), "vi");
});

test("supported browser preference outranks coarse country hint", () => {
  assert.equal(resolveInitialLanguage(null, ["en-US"], "VN"), "en");
  assert.equal(resolveInitialLanguage(null, ["vi-VN"], "US"), "vi");
});

test("first-visit Simplified Chinese preference stays script-safe", () => {
  assert.equal(resolveInitialLanguage(null, ["zh-Hans-CN"], "VN"), "zh");
  assert.equal(resolveInitialLanguage(null, ["zh-CN"], "US"), "zh");
  assert.equal(resolveInitialLanguage(null, ["zh-SG"], "US"), "zh");
  assert.equal(resolveInitialLanguage("vi", ["zh-Hans-CN"], "CN"), "vi");
  // Bare zh names no script, so it is never silently resolved.
  assert.equal(resolveInitialLanguage(null, ["zh"]), "en");
});

test("first-visit Traditional Chinese preference resolves to zh-hant", () => {
  assert.equal(resolveInitialLanguage(null, ["zh-Hant-TW"]), "zh-hant");
  assert.equal(resolveInitialLanguage(null, ["zh-Hant"]), "zh-hant");
  assert.equal(resolveInitialLanguage(null, ["zh-TW"], "US"), "zh-hant");
  assert.equal(resolveInitialLanguage(null, ["zh-HK"]), "zh-hant");
  assert.equal(resolveInitialLanguage(null, ["zh-MO"]), "zh-hant");
  assert.equal(resolveInitialLanguage("zh", ["zh-Hant-TW"]), "zh");
  assert.equal(resolveInitialLanguage("zh-hant", ["zh-CN"]), "zh-hant");
});

test("coarse country hint fills only the unresolved first-visit gap", () => {
  assert.equal(resolveInitialLanguage(null, ["fr-FR"], "VN"), "vi");
  assert.equal(resolveInitialLanguage(null, ["fr-FR"], "FR"), "en");
  assert.equal(resolveInitialLanguage(null, ["zh"], "VN"), "vi");
});
