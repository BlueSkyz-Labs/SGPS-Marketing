/**
 * Edge locale resolution for requests to the site root (`/`).
 *
 * Order (first match wins):
 *   1. explicit choice   cookie `bsl_lang` (validated against supported list)
 *   2. country           VN -> vi; TW/HK/MO -> Traditional Chinese (or zh);
 *                        CN/SG -> zh; any other country falls through
 *   3. Accept-Language   best supported match, q-values honoured
 *   4. default           en
 *
 * Known crawlers skip 1-3 and always get the default so indexing is stable.
 *
 * Pure and dependency-light (no Workers types) so `node --test` can load it.
 * Country is used only in-flight to pick a redirect; it is never stored.
 * Localized URLs stay stable and country never infers jurisdiction, currency,
 * identity or commercial market (SGPS-DEC-2026-019).
 */
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./i18n.ts";
import { readLanguageCookieValue } from "./language-cookie.ts";

export type LocaleSource =
  "cookie" | "country" | "accept-language" | "crawler" | "default";

export interface LocaleInput {
  cookieHeader?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
}

export interface LocaleOptions {
  /**
   * Language codes the build publishes. Defaults to SUPPORTED_LANGUAGES, so a
   * `zh-hant` locale added to i18n.ts is picked up automatically at build time.
   */
  supported?: readonly string[];
}

export interface LocaleDecision {
  language: string;
  source: LocaleSource;
}

const TRADITIONAL_CODE = "zh-hant";
const SIMPLIFIED_CODE = "zh";
const TRADITIONAL_COUNTRIES = new Set(["TW", "HK", "MO"]);
const SIMPLIFIED_COUNTRIES = new Set(["CN", "SG"]);
const MAX_ACCEPT_LANGUAGE_LENGTH = 1024;
const MAX_ACCEPT_LANGUAGE_ENTRIES = 32;

const CRAWLER_PATTERN =
  /googlebot|google-inspectiontool|adsbot-google|bingbot|bingpreview|msnbot|slurp|duckduckbot|baiduspider|yandex|applebot|petalbot|sogou|facebookexternalhit|twitterbot|linkedinbot|semrushbot|ahrefsbot|\b(?:bot|crawler|spider)\b/i;

export function isKnownCrawler(userAgent: string | null | undefined): boolean {
  return Boolean(userAgent) && CRAWLER_PATTERN.test(userAgent as string);
}

function traditionalOrSimplified(supported: readonly string[]): string | null {
  if (supported.includes(TRADITIONAL_CODE)) return TRADITIONAL_CODE;
  if (supported.includes(SIMPLIFIED_CODE)) return SIMPLIFIED_CODE;
  return null;
}

function languageForCountry(
  country: string | null | undefined,
  supported: readonly string[],
): string | null {
  const code = country?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{2}$/.test(code)) return null;
  if (code === "VN") return supported.includes("vi") ? "vi" : null;
  if (TRADITIONAL_COUNTRIES.has(code))
    return traditionalOrSimplified(supported);
  if (SIMPLIFIED_COUNTRIES.has(code)) {
    return supported.includes(SIMPLIFIED_CODE) ? SIMPLIFIED_CODE : null;
  }
  return null;
}

function languageForTag(
  tag: string,
  supported: readonly string[],
): string | null {
  if (tag === "vi" || tag.startsWith("vi-")) {
    return supported.includes("vi") ? "vi" : null;
  }
  if (tag === "en" || tag.startsWith("en-")) {
    return supported.includes("en") ? "en" : null;
  }
  if (tag === "zh" || tag.startsWith("zh-")) {
    const traditional =
      /^zh-(?:tw|hk|mo)(?:-|$)/.test(tag) || /^zh-hant(?:-|$)/.test(tag);
    if (traditional) return traditionalOrSimplified(supported);
    return supported.includes(SIMPLIFIED_CODE) ? SIMPLIFIED_CODE : null;
  }
  return null;
}

/** Highest-q supported language from an Accept-Language header, or null. */
export function languageFromAcceptLanguage(
  header: string | null | undefined,
  supported: readonly string[] = SUPPORTED_LANGUAGES,
): string | null {
  if (!header || header.length > MAX_ACCEPT_LANGUAGE_LENGTH) return null;
  const entries: { tag: string; q: number; index: number }[] = [];
  const parts = header.split(",").slice(0, MAX_ACCEPT_LANGUAGE_ENTRIES);
  parts.forEach((part, index) => {
    const [rawTag = "", ...params] = part.split(";");
    const tag = rawTag.trim().toLowerCase();
    if (!tag || tag === "*") return;
    let q = 1;
    for (const param of params) {
      if (!/^\s*q\s*=/i.test(param)) continue;
      const match = /^\s*q\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*$/i.exec(param);
      // A malformed q-value disqualifies the entry rather than defaulting to 1.
      q = match ? Math.min(Number(match[1]), 1) : 0;
    }
    if (q > 0) entries.push({ tag, q, index });
  });
  entries.sort((a, b) => b.q - a.q || a.index - b.index);
  for (const entry of entries) {
    const language = languageForTag(entry.tag, supported);
    if (language) return language;
  }
  return null;
}

export function resolveLocale(
  input: LocaleInput,
  options: LocaleOptions = {},
): LocaleDecision {
  const supported = options.supported ?? SUPPORTED_LANGUAGES;
  const fallback = supported.includes(DEFAULT_LANGUAGE)
    ? DEFAULT_LANGUAGE
    : (supported[0] ?? DEFAULT_LANGUAGE);

  if (isKnownCrawler(input.userAgent)) {
    return { language: fallback, source: "crawler" };
  }

  const cookie = readLanguageCookieValue(input.cookieHeader);
  if (cookie && supported.includes(cookie)) {
    return { language: cookie, source: "cookie" };
  }

  const byCountry = languageForCountry(input.country, supported);
  if (byCountry) return { language: byCountry, source: "country" };

  const byHeader = languageFromAcceptLanguage(input.acceptLanguage, supported);
  if (byHeader) return { language: byHeader, source: "accept-language" };

  return { language: fallback, source: "default" };
}
