import assert from "node:assert/strict";
import test from "node:test";

const {
  getLanguageFromPath,
  getAlternatePath,
  stripLanguagePrefix,
  SUPPORTED_LANGUAGES,
  LANGUAGES,
} = await import("../../src/lib/i18n.ts");

test("getLanguageFromPath defaults to en", () => {
  assert.equal(getLanguageFromPath("/about/"), "en");
  assert.equal(getLanguageFromPath("/en/about/"), "en");
  assert.equal(getLanguageFromPath("/vi/about/"), "vi");
});

test("getAlternatePath produces correct alternates", () => {
  assert.equal(getAlternatePath("/en/about/", "vi"), "/vi/about/");
  assert.equal(getAlternatePath("/vi/about/", "en"), "/en/about/");
  assert.equal(getAlternatePath("/about/", "vi"), "/vi/about/");
});

test("stripLanguagePrefix removes prefix", () => {
  assert.equal(stripLanguagePrefix("/en/about/"), "/about/");
  assert.equal(stripLanguagePrefix("/vi/about/"), "/about/");
});

test("SUPPORTED_LANGUAGES and LANGUAGES are consistent", () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "vi"]);
  assert.equal(LANGUAGES.en.hreflang, "en");
  assert.equal(LANGUAGES.vi.hreflang, "vi");
});
