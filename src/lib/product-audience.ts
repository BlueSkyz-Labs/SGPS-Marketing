import type { Language } from "@/lib/i18n";

/**
 * Product-specific audience wording where the generic enum labels would
 * misdescribe the audience (Owner decision F1, 2026-10-01: Sổ Trọ is for
 * individual landlords). Presentation only; the registry `audience` enum stays
 * the typed source of truth.
 */
export const PRODUCT_AUDIENCE_LABEL: Record<
  string,
  Record<Language, string>
> = {
  sotro: {
    en: "Landlords",
    vi: "Chủ trọ",
    zh: "房东",
    "zh-hant": "房東",
  },
};

export function audienceText(
  slug: string,
  audience: readonly string[],
  labels: Record<string, string>,
  lang: Language,
): string {
  return (
    PRODUCT_AUDIENCE_LABEL[slug]?.[lang] ??
    audience.map((a) => labels[a] ?? a).join(", ")
  );
}
