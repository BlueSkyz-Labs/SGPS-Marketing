/**
 * Locale suggestion contract (ADR 0009, no-cookie variant).
 *
 * The banner is a client-side, link-only suggestion. Pinned invariants:
 * navigator.languages is the only signal (no timezone/country/IP), no cookie,
 * no network, no automatic navigation, and the only storage key ever touched
 * is `blueskyz.ui.language`. Each audit has a negative proof that intentionally
 * breaks the invariant.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  suggestLanguage,
  explicitPathLanguage,
  LOCALE_SUGGESTION_COPY,
  keepLabel,
} = await import("../../src/lib/locale-suggestion.ts");
const { SUPPORTED_LANGUAGES } = await import("../../src/lib/i18n.ts");

const SCRIPT = readFileSync("src/scripts/locale-suggestion.ts", "utf8");
const LIB = readFileSync("src/lib/locale-suggestion.ts", "utf8");
const HOST = readFileSync(
  "src/components/layout/LocaleSuggestion.astro",
  "utf8",
);
const LAYOUT = readFileSync("src/layouts/BaseLayout.astro", "utf8");

const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

export function auditNoTracking(source) {
  const code = stripComments(source);
  const problems = [];
  if (/document\s*\.\s*cookie|cookieStore/.test(code))
    problems.push("touches cookies");
  if (/\bfetch\s*\(|sendBeacon|XMLHttpRequest|WebSocket|EventSource/.test(code))
    problems.push("makes a network request");
  if (/Intl\s*\.\s*DateTimeFormat|timeZone|getTimezoneOffset/.test(code))
    problems.push("reads a timezone/location signal");
  if (/sessionStorage|indexedDB/.test(code))
    problems.push("uses another storage");
  return problems;
}

export function auditNoAutoNavigation(source) {
  const code = stripComments(source);
  const problems = [];
  if (
    /location\s*\.\s*(assign|replace|href\s*=)|location\s*=|history\s*\.\s*(push|replace)State|window\.open/.test(
      code,
    )
  )
    problems.push("navigates from script");
  return problems;
}

export function auditStorageKeys(source) {
  const code = stripComments(source);
  const problems = [];
  const calls = [
    ...code.matchAll(
      /localStorage\s*\.\s*(?:get|set|remove)Item\(\s*([^,)]+)/g,
    ),
  ];
  for (const [, key] of calls) {
    if (key.trim() !== "LANGUAGE_STORAGE_KEY")
      problems.push(`storage key ${key.trim()}`);
  }
  if (/localStorage\s*\.\s*(clear|key)\b|localStorage\s*\[/.test(code))
    problems.push("indirect storage access");
  return problems;
}

test("script and lib never use cookies, network, timezone or extra storage", () => {
  assert.deepEqual(auditNoTracking(SCRIPT), []);
  assert.deepEqual(auditNoTracking(LIB), []);
  assert.deepEqual(
    auditNoTracking(HOST.replace(/<style[\s\S]*<\/style>/, "")),
    [],
  );
});

test("script never navigates by itself; accept is a real link", () => {
  assert.deepEqual(auditNoAutoNavigation(SCRIPT), []);
  assert.match(SCRIPT, /createElement\("a"\)/);
  assert.match(SCRIPT, /accept\.href = getAlternatePath\(/);
});

test("the only storage key is blueskyz.ui.language, reads and writes guarded", () => {
  assert.deepEqual(auditStorageKeys(SCRIPT), []);
  const guarded = [...SCRIPT.matchAll(/localStorage/g)].length;
  const tries = [...SCRIPT.matchAll(/\btry\s*\{/g)].length;
  assert.ok(tries >= 2 && guarded >= 2, "read and write must each be in try");
  // Fails closed when storage cannot be read.
  assert.match(SCRIPT, /catch \{\s*return;/);
});

test("banner is external-script only, in-flow (never an overlay), accessible and reduced-motion safe", () => {
  assert.doesNotMatch(HOST, /is:inline/);
  assert.match(HOST, /<script>\s*import \{ initLocaleSuggestion \}/);
  assert.match(LAYOUT, /<LocaleSuggestion \/>/);
  assert.match(SCRIPT, /setAttribute\("role", "region"\)/);
  assert.match(SCRIPT, /setAttribute\("aria-label", copy\.question\)/);
  // S5 placement: an in-flow strip under the header, never a fixed/sticky/
  // absolute overlay that could cover first-viewport content.
  assert.doesNotMatch(HOST, /position:\s*(?:fixed|sticky|absolute)/);
  assert.match(SCRIPT, /header\.after\(region\)/);
  assert.match(HOST, /min-height: 44px/);
  assert.match(HOST, /prefers-reduced-motion: reduce[\s\S]*transition: none/);
  assert.match(HOST, /var\(--surface-raised\)/);
  assert.doesNotMatch(HOST, /background:\s*(?:white|#fff)/i);
});

test("negative proof: an overlay placement is detected by the placement audit", () => {
  const overlay = "position: fixed; inset: auto 1rem 1rem 1rem;";
  assert.match(overlay, /position:\s*(?:fixed|sticky|absolute)/);
});

test("dismiss stores the CURRENT language via the existing key", () => {
  assert.match(SCRIPT, /keep\.addEventListener\("click"[\s\S]*persist\(page\)/);
  assert.match(
    SCRIPT,
    /accept\.addEventListener\("click", \(\) => persist\(target\)\)/,
  );
});

test("every locale has copy, zh-hant is marked machine-assisted", () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    const copy = LOCALE_SUGGESTION_COPY[lang];
    assert.ok(copy.question && copy.accept && copy.keep.includes("{language}"));
  }
  assert.equal(
    LOCALE_SUGGESTION_COPY.vi.question,
    "Xem trang bằng Tiếng Việt?",
  );
  assert.equal(
    LOCALE_SUGGESTION_COPY.en.question,
    "View this page in English?",
  );
  assert.match(LIB, /machine-assisted \(OpenCC s2twp\), pending native review/);
  assert.equal(keepLabel("vi", "en"), "Giữ English");
});

test("negative proofs: each audit detects its broken invariant", () => {
  assert.ok(auditNoTracking('document.cookie = "a=b"').length > 0);
  assert.ok(auditNoTracking('fetch("/x")').length > 0);
  assert.ok(auditNoTracking("navigator.sendBeacon(u)").length > 0);
  assert.ok(
    auditNoTracking("Intl.DateTimeFormat().resolvedOptions().timeZone").length >
      0,
  );
  assert.ok(auditNoTracking("sessionStorage.setItem(a,b)").length > 0);
  assert.ok(auditNoAutoNavigation("window.location.href = url").length > 0);
  assert.ok(auditNoAutoNavigation("location.replace(url)").length > 0);
  assert.ok(
    auditStorageKeys('window.localStorage.setItem("dismissed", "1")').length >
      0,
  );
  assert.ok(auditStorageKeys("localStorage.clear()").length > 0);
  // Comments are not code.
  assert.deepEqual(auditNoTracking("// no document.cookie here"), []);
});

test("suggestLanguage: stored choice wins, browser order, no timezone", () => {
  assert.equal(suggestLanguage("en", ["vi-VN"], "en"), null);
  assert.equal(suggestLanguage("vi", ["vi-VN"], "en"), null);
  assert.equal(suggestLanguage(null, ["vi-VN", "en-US"], "en"), "vi");
  assert.equal(suggestLanguage(null, ["en-US", "vi-VN"], "vi"), "en");
  // First supported language decides, later ones never override.
  assert.equal(suggestLanguage(null, ["vi-VN", "en-US"], "vi"), null);
  assert.equal(suggestLanguage(null, ["fr-FR", "vi"], "en"), "vi");
  assert.equal(suggestLanguage(undefined, ["en"], "en"), null);
  // Garbage in storage is not an explicit choice.
  assert.equal(suggestLanguage("klingon", ["vi"], "en"), "vi");
});

test("suggestLanguage: Chinese scripts and unknowns", () => {
  assert.equal(suggestLanguage(null, ["zh-CN"], "en"), "zh");
  assert.equal(suggestLanguage(null, ["zh-Hans-SG"], "vi"), "zh");
  assert.equal(suggestLanguage(null, ["zh-TW"], "en"), "zh-hant");
  assert.equal(suggestLanguage(null, ["zh-HK"], "zh"), "zh-hant");
  assert.equal(suggestLanguage(null, ["zh-Hant"], "zh-hant"), null);
  // Bare / unknown-script zh is never guessed, and never falls through to en.
  assert.equal(suggestLanguage(null, ["zh", "en"], "vi"), null);
  assert.equal(suggestLanguage(null, ["zh-Foo", "en"], "vi"), null);
  // Unknown language, empty list -> no banner.
  assert.equal(suggestLanguage(null, ["fr-FR", "de"], "en"), null);
  assert.equal(suggestLanguage(null, [], "en"), null);
});

test("explicitPathLanguage: only explicit locale URLs", () => {
  assert.equal(explicitPathLanguage("/en/about/"), "en");
  assert.equal(explicitPathLanguage("/zh-hant/"), "zh-hant");
  assert.equal(explicitPathLanguage("/zh/x"), "zh");
  assert.equal(explicitPathLanguage("/"), null);
  assert.equal(explicitPathLanguage("/about/"), null);
  assert.equal(explicitPathLanguage("/english/"), null);
});
