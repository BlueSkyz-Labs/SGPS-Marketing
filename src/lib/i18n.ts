export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

export interface LanguageConfig {
  code: Language;
  label: string;
  hreflang: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: { code: "en", label: "English", hreflang: "en" },
  vi: { code: "vi", label: "Tiếng Việt", hreflang: "vi" },
};

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
