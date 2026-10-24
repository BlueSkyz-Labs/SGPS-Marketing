import { LANGUAGES, type Language } from "./i18n.ts";

/**
 * Owner 2026-10-24 (O-04): the App-Store-style "Languages" fact of a product,
 * derived from the record's `appLanguages` (BCP 47 codes) and nothing else.
 * Names come from `Intl.DisplayNames` in the page locale, never from a
 * hand-written table, so a new code needs no copy. A record without the field
 * yields no row.
 */
export function appLanguageNames(
  codes: readonly string[] | undefined,
  pageLang: Language,
): string | null {
  if (!codes || codes.length === 0) return null;
  const locale = LANGUAGES[pageLang].hreflang;
  const names = new Intl.DisplayNames([locale], { type: "language" });
  const list = codes.map((code) => names.of(code) ?? code);
  return new Intl.ListFormat([locale], {
    style: "long",
    type: "conjunction",
  }).format(list);
}
