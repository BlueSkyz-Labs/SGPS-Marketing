/**
 * Locale-aware display of authored ISO dates (v7 D-20).
 *
 * The ISO date stays in `<time datetime>`; only the visible text is localized.
 * Pure, no clock: the same input always renders the same text. Anything that is
 * not a plain `YYYY-MM-DD` date is returned unchanged rather than guessed.
 */

export type DisplayLanguage = "en" | "vi" | "zh" | "zh-hant";

/** BCP 47 tags: Simplified Chinese is zh-CN, Traditional is zh-TW (a locale, not a script conversion). */
export const DISPLAY_DATE_LOCALES: Record<DisplayLanguage, string> = {
  en: "en",
  vi: "vi",
  zh: "zh-CN",
  "zh-hant": "zh-TW",
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(lang: DisplayLanguage): Intl.DateTimeFormat {
  const tag = DISPLAY_DATE_LOCALES[lang] ?? DISPLAY_DATE_LOCALES.en;
  let formatter = formatters.get(tag);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    formatters.set(tag, formatter);
  }
  return formatter;
}

export function formatDisplayDate(iso: string, lang: DisplayLanguage): string {
  const match = ISO_DATE.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  // Reject rolled-over dates such as 2026-02-31.
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return iso;
  }
  return formatterFor(lang).format(date);
}
