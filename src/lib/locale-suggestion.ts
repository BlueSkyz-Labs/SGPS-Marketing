/**
 * Locale suggestion (ADR 0009, no-cookie variant).
 *
 * Pure decision + copy for the dismissible "view this page in <language>?"
 * banner. Inference uses `navigator.languages` only, in the existing resolver
 * order (`normalizeActiveBrowserLanguage`). There is deliberately no timezone,
 * country or IP signal (ADR 0009 rule 8), no network, no cookie and no
 * redirect: the banner only offers a link.
 *
 * The only persisted value is the explicit language code in
 * `LANGUAGE_STORAGE_KEY` (ADR 0009 rules 5-6). Accepting stores the suggested
 * language; dismissing ("Keep <current>") stores the CURRENT page language.
 * Both are explicit choices, so the banner never returns once either happens.
 */
import {
  LANGUAGES,
  isActiveLanguage,
  normalizeActiveBrowserLanguage,
  type Language,
} from "./i18n.ts";

/** Explicit localized URLs only; the `/` gateway and non-locale pages never get a banner. */
export function explicitPathLanguage(pathname: string): Language | null {
  const segment = /^\/(en|vi|zh-hant|zh)(?:\/|$)/.exec(pathname)?.[1];
  return isActiveLanguage(segment) ? segment : null;
}

/**
 * The language to suggest, or null for "show nothing".
 * - any stored explicit choice -> null (the visitor already chose);
 * - the first browser language that maps to a published locale decides;
 * - an ambiguous Chinese tag (bare `zh`, `zh-Foo`) is unknown -> null, never a
 *   guessed script;
 * - no supported browser language -> null.
 */
export function suggestLanguage(
  stored: string | null | undefined,
  browserLanguages: readonly string[],
  pageLanguage: Language,
): Language | null {
  if (isActiveLanguage(stored)) return null;
  for (const tag of browserLanguages) {
    const active = normalizeActiveBrowserLanguage(tag);
    if (active) return active === pageLanguage ? null : active;
    if (/^zh(?:-|$)/i.test(tag.trim())) return null;
  }
  return null;
}

export interface LocaleSuggestionCopy {
  /** Visible question and accessible name of the region. */
  question: string;
  accept: string;
  /** `{language}` is replaced by the current language endonym. */
  keep: string;
}

/**
 * Copy is written in the SUGGESTED language (the one the visitor reads best).
 * zh-hant copy: machine-assisted (OpenCC s2twp), pending native review.
 */
export const LOCALE_SUGGESTION_COPY: Record<Language, LocaleSuggestionCopy> = {
  en: {
    question: "View this page in English?",
    accept: "Switch to English",
    keep: "Keep {language}",
  },
  vi: {
    question: "Xem trang bằng Tiếng Việt?",
    accept: "Chuyển sang Tiếng Việt",
    keep: "Giữ {language}",
  },
  zh: {
    question: "使用简体中文查看此页面？",
    accept: "切换到简体中文",
    keep: "保持{language}",
  },
  "zh-hant": {
    question: "使用繁體中文檢視此頁面？",
    accept: "切換至繁體中文",
    keep: "保持{language}",
  },
};

export function keepLabel(target: Language, current: Language): string {
  return LOCALE_SUGGESTION_COPY[target].keep.replace(
    "{language}",
    LANGUAGES[current].label,
  );
}
