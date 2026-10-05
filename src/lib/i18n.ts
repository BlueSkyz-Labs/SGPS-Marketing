import { formatDisplayDate } from "./display-date.ts";

export const PORTFOLIO_LANGUAGE_TARGETS = [
  "en",
  "vi",
  "zh-Hans",
  "zh-Hant",
] as const;
export type PortfolioLanguageTarget =
  (typeof PORTFOLIO_LANGUAGE_TARGETS)[number];

// [[resolution]] C3-C W1 promoted the simplified-Chinese runtime locale (zh)
// to first-class. The Traditional-Chinese runtime locale (`zh-hant`, URL
// segment `/zh-hant/`, hreflang zh-Hant) is now first-class as well; its copy
// is machine-assisted (OpenCC s2twp) and pending native review.
export const LANGUAGE_READINESS = {
  en: "FIRST_CLASS",
  vi: "FIRST_CLASS",
  "zh-Hans": "FIRST_CLASS",
  "zh-Hant": "FIRST_CLASS",
} as const satisfies Record<
  PortfolioLanguageTarget,
  "FIRST_CLASS" | "ARCHITECTURE_READY"
>;

export const SUPPORTED_LANGUAGES = ["en", "vi", "zh", "zh-hant"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "blueskyz.ui.language";

export interface LanguageConfig {
  code: Language;
  /** Endonym shown in the switcher (a visitor reads their own language first). */
  label: string;
  /**
   * BCP-47 tag emitted as hreflang and `<html lang>`; `zh` is Simplified
   * Chinese (zh-Hans) and `zh-hant` is Traditional Chinese (zh-Hant).
   */
  hreflang: string;
  /** Compact code shown on the switcher trigger (EN / VI / 简 / 繁). */
  shortLabel: string;
  /** English name for assistive technology and non-visual consumers. */
  englishLabel: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: {
    code: "en",
    label: "English",
    shortLabel: "EN",
    hreflang: "en",
    englishLabel: "English",
  },
  vi: {
    code: "vi",
    label: "Tiếng Việt",
    shortLabel: "VI",
    hreflang: "vi",
    englishLabel: "Vietnamese",
  },
  zh: {
    code: "zh",
    label: "简体中文",
    shortLabel: "简",
    hreflang: "zh-Hans",
    englishLabel: "Simplified Chinese",
  },
  "zh-hant": {
    code: "zh-hant",
    label: "繁體中文",
    shortLabel: "繁",
    hreflang: "zh-Hant",
    englishLabel: "Traditional Chinese",
  },
};

export function isActiveLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  );
}

export function normalizeActiveBrowserLanguage(
  value: string | null | undefined,
): Language | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized === "vi" || normalized.startsWith("vi-")) return "vi";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  // Script-explicit Hans and region-explicit CN/SG are published via /zh/;
  // script-explicit Hant and region-explicit TW/HK/MO via /zh-hant/. Bare zh
  // remains unresolved rather than silently choosing a script.
  if (/^zh-(?:hans|cn|sg)(?:-|$)/.test(normalized)) return "zh";
  if (/^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(normalized)) return "zh-hant";
  return null;
}

/**
 * SGPS-DEC-2026-019 first-visit resolution:
 * explicit saved choice -> supported browser/device preference -> optional
 * coarse country hint (VN -> VI, elsewhere -> EN) -> English.
 *
 * Country is a weak presentation hint only. Localized URLs remain stable and
 * never infer jurisdiction, currency, identity or commercial market.
 */
export function resolveInitialLanguage(
  stored: string | null,
  browserLanguages: readonly string[] = [],
  countryHint?: string | null,
): Language {
  if (isActiveLanguage(stored)) return stored;

  for (const browserLanguage of browserLanguages) {
    const active = normalizeActiveBrowserLanguage(browserLanguage);
    if (active) return active;
  }

  const country = countryHint?.trim().toUpperCase();
  if (country) return country === "VN" ? "vi" : "en";

  return DEFAULT_LANGUAGE;
}

export function getLanguageFromPath(pathname: string): Language {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "vi") return "vi";
  if (segment === "zh") return "zh";
  if (segment === "zh-hant") return "zh-hant";
  return "en";
}

export function getAlternatePath(
  pathname: string,
  targetLang: Language,
): string {
  const rest = pathname.replace(/^\/(en|vi|zh-hant|zh)(?=\/|$)/, "") || "/";
  return `/${targetLang}${rest}`;
}

export function stripLanguagePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|vi|zh-hant|zh)(?=\/|$)/, "") || "/";
}

/**
 * The one visible-date formatter (v8 W7). Locale-aware through `Intl.DateTimeFormat`
 * (vi "12 tháng 9, 2026", zh/zh-hant "2026年9月12日"); non-ISO input is returned unchanged.
 */
export function formatDate(locale: Language, iso: string): string {
  return formatDisplayDate(iso, locale);
}
