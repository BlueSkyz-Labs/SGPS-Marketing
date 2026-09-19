export const PORTFOLIO_LANGUAGE_TARGETS = [
  "en",
  "vi",
  "zh-Hans",
  "zh-Hant",
] as const;
export type PortfolioLanguageTarget =
  (typeof PORTFOLIO_LANGUAGE_TARGETS)[number];

export const LANGUAGE_READINESS = {
  en: "FIRST_CLASS",
  vi: "FIRST_CLASS",
  "zh-Hans": "ARCHITECTURE_READY",
  "zh-Hant": "ARCHITECTURE_READY",
} as const satisfies Record<
  PortfolioLanguageTarget,
  "FIRST_CLASS" | "ARCHITECTURE_READY"
>;

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "blueskyz.ui.language";

export interface LanguageConfig {
  code: Language;
  label: string;
  hreflang: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: { code: "en", label: "English", hreflang: "en" },
  vi: { code: "vi", label: "Tiếng Việt", hreflang: "vi" },
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
  return "en";
}

export function getAlternatePath(
  pathname: string,
  targetLang: Language,
): string {
  const rest = pathname.replace(/^\/(en|vi)/, "") || "/";
  return `/${targetLang}${rest}`;
}

export function stripLanguagePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|vi)/, "") || "/";
}
