import assert from "node:assert/strict";
import test from "node:test";

const { resolveLocale, languageFromAcceptLanguage, isKnownCrawler } =
  await import("../../src/lib/locale-resolve.ts");
const { serializeLanguageCookie, readLanguageCookieValue } =
  await import("../../src/lib/language-cookie.ts");

const BASE = ["en", "vi", "zh"];
const WITH_HANT = ["en", "vi", "zh", "zh-hant"];
const lang = (input, supported = BASE) =>
  resolveLocale(input, { supported }).language;

test("cookie wins over country and Accept-Language", () => {
  const d = resolveLocale(
    { cookieHeader: "a=b; bsl_lang=zh", country: "VN", acceptLanguage: "vi" },
    { supported: BASE },
  );
  assert.deepEqual(d, { language: "zh", source: "cookie" });
});

test("VN -> vi", () => {
  assert.deepEqual(resolveLocale({ country: "VN" }, { supported: BASE }), {
    language: "vi",
    source: "country",
  });
  assert.equal(lang({ country: "vn" }), "vi");
});

test("country wins over Accept-Language (VN + en -> vi)", () => {
  assert.equal(lang({ country: "VN", acceptLanguage: "en-US,en;q=0.9" }), "vi");
});

test("unmapped country falls through to Accept-Language (US + vi -> vi)", () => {
  assert.deepEqual(
    resolveLocale({ country: "US", acceptLanguage: "vi" }, { supported: BASE }),
    { language: "vi", source: "accept-language" },
  );
});

test("CN and SG -> zh", () => {
  assert.equal(lang({ country: "CN", acceptLanguage: "en" }), "zh");
  assert.equal(lang({ country: "SG", acceptLanguage: "en" }), "zh");
});

test("TW/HK/MO -> zh without zh-hant, zh-hant with it", () => {
  for (const country of ["TW", "HK", "MO"]) {
    assert.equal(lang({ country }, BASE), "zh");
    assert.equal(lang({ country }, WITH_HANT), "zh-hant");
  }
});

test("Accept-Language zh-TW/zh-HK/zh-MO/zh-Hant maps to Traditional-or-zh", () => {
  for (const tag of ["zh-TW", "zh-HK", "zh-MO", "zh-Hant", "zh-Hant-TW"]) {
    assert.equal(lang({ acceptLanguage: tag }, BASE), "zh", tag);
    assert.equal(lang({ acceptLanguage: tag }, WITH_HANT), "zh-hant", tag);
  }
});

test("Accept-Language zh, zh-CN, zh-Hans -> zh; en-* -> en; vi-VN -> vi", () => {
  for (const tag of ["zh", "zh-CN", "zh-Hans", "zh-SG"]) {
    assert.equal(lang({ acceptLanguage: tag }, WITH_HANT), "zh", tag);
  }
  assert.equal(lang({ acceptLanguage: "en-GB" }), "en");
  assert.equal(lang({ acceptLanguage: "vi-VN" }), "vi");
});

test("q-values are honoured, q=0 excluded, order breaks ties", () => {
  assert.equal(languageFromAcceptLanguage("en;q=0.5, vi;q=0.9", BASE), "vi");
  assert.equal(languageFromAcceptLanguage("vi;q=0, en;q=0.1", BASE), "en");
  assert.equal(languageFromAcceptLanguage("en, vi", BASE), "en");
  assert.equal(
    languageFromAcceptLanguage("fr, de;q=0.8, zh;q=0.7", BASE),
    "zh",
  );
  assert.equal(languageFromAcceptLanguage("fr, *;q=0.5", BASE), null);
  assert.equal(languageFromAcceptLanguage("vi;q=abc", BASE), null);
});

test("invalid or unsupported cookie is ignored", () => {
  assert.equal(
    lang({ cookieHeader: "bsl_lang=fr", acceptLanguage: "vi" }),
    "vi",
  );
  assert.equal(lang({ cookieHeader: "bsl_lang=%E0%A4%A" }), "en");
  assert.equal(lang({ cookieHeader: "bsl_lang=../evil" }), "en");
  // zh-hant cookie is only valid when the build supports it.
  assert.equal(lang({ cookieHeader: "bsl_lang=zh-hant" }, BASE), "en");
  assert.equal(
    lang({ cookieHeader: "bsl_lang=zh-hant" }, WITH_HANT),
    "zh-hant",
  );
  assert.equal(lang({ cookieHeader: "xbsl_lang=zh" }), "en");
});

test("known crawlers get en regardless of cookie, country or language", () => {
  const ua =
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
  assert.deepEqual(
    resolveLocale(
      {
        userAgent: ua,
        country: "VN",
        acceptLanguage: "vi",
        cookieHeader: "bsl_lang=zh",
      },
      { supported: BASE },
    ),
    { language: "en", source: "crawler" },
  );
  assert.equal(isKnownCrawler("Mozilla/5.0 (compatible; bingbot/2.0)"), true);
  assert.equal(
    isKnownCrawler(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1",
    ),
    false,
  );
});

test("defaults to en with no signal or oversized headers", () => {
  assert.deepEqual(resolveLocale({}, { supported: BASE }), {
    language: "en",
    source: "default",
  });
  assert.equal(lang({ country: "XX", acceptLanguage: "fr" }), "en");
  assert.equal(lang({ acceptLanguage: `vi,${"x".repeat(2000)}` }), "en");
});

test("default supported list is the site's SUPPORTED_LANGUAGES", () => {
  assert.equal(resolveLocale({ country: "VN" }).language, "vi");
});

test("cookie serialization: attributes and round-trip", () => {
  const value = serializeLanguageCookie("vi");
  assert.equal(
    value,
    "bsl_lang=vi; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
  );
  assert.doesNotMatch(
    serializeLanguageCookie("vi", { secure: false }),
    /Secure/,
  );
  assert.equal(readLanguageCookieValue("x=1; bsl_lang=vi; y=2"), "vi");
  assert.equal(readLanguageCookieValue(null), null);
});
