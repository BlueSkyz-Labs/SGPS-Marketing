import type { Language } from "@/lib/i18n";

/** Visible label for the "as of" line (UX P2-10). */
export const LAST_UPDATED_LABEL: Record<Language, string> = {
  en: "Last updated",
  vi: "Cập nhật lần cuối",
  zh: "最后更新",
  "zh-hant": "最後更新",
};

export interface LastUpdatedView {
  label: string;
  datetime: string;
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
  };
}
