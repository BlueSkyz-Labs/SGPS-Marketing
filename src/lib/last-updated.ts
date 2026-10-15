import type { Language } from "@/lib/i18n";

/** Visible label for the "as of" line (UX P2-10). */
export const LAST_UPDATED_LABEL: Record<Language, string> = {
  en: "Last updated",
  vi: "Cập nhật lần cuối",
  zh: "最后更新",
  "zh-hant": "最後更新",
};

const INTL_LOCALE: Record<Language, string> = {
  en: "en",
  vi: "vi",
  zh: "zh-CN",
  "zh-hant": "zh-Hant",
};

/** Locale-formatted `YYYY-MM-DD`; the date is read as UTC so it never shifts. */
export function formatLastUpdated(isoDate: string, lang: Language): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export interface LastUpdatedView {
  label: string;
  datetime: string;
  text: string;
}

/** Render model: `null` (omit the line) whenever there is no accurate date. */
export function lastUpdatedView(
  lastmod: string | undefined,
  lang: Language,
): LastUpdatedView | null {
  if (!lastmod) return null;
  return {
    label: LAST_UPDATED_LABEL[lang],
    datetime: lastmod,
    text: formatLastUpdated(lastmod, lang),
  };
}
