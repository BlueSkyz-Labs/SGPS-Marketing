import type { Language } from "@/data/site";

/**
 * v8 W2 home copy, verbatim from docs/superpowers/plans/v8/copy-deck.md
 * (rows hom-2, hom-6, hom-8, hom-9, hom-14). Home-only strings: the product
 * registry (`src/content/products/*.yaml`) stays the truth for claim binding
 * and profile pages. zh and zh-hant are deck suggestions, NOT VERIFIED by a
 * native reviewer.
 */
type Localized = Record<Language, string>;

/** hom-2: product line under the H1, as segments around the two product names. */
export const HOME_PRODUCT_LINE: Record<
  Language,
  { lead: string; a: string; b: string }
> = {
  en: {
    lead: "In development: ",
    a: ", a notebook for landlords, and ",
    b: ", a private journal.",
  },
  vi: {
    lead: "Đang phát triển: ",
    a: ", sổ tay cho chủ trọ, và ",
    b: ", nhật ký riêng tư.",
  },
  zh: { lead: "开发中：", a: "，房东记事本；", b: "，私密日记。" },
  "zh-hant": { lead: "開發中：", a: "，房東記事本；", b: "，私密日記。" },
};

/**
 * hom-6 (Sổ Trọ) and hom-14 (Sổ Tâm) one-liners, English only. The vi, zh and
 * zh-hant lines are identical to `i18n.<lang>.shortDescription` in
 * `src/content/products/{sotro,sotam}.yaml`, so callers fall back to the
 * registry copy for them; the English home line differs from the registry's
 * base `shortDescription`, so it stays here.
 */
export const HOME_ONE_LINER: Record<
  string,
  Partial<Record<Language, string>> | undefined
> = {
  sotro: {
    en: "For landlords in Vietnam. Track rooms, unpaid rent and what needs doing today.",
  },
  sotam: {
    en: "A private, local-first journal for reflections and memories.",
  },
};

/** hom-8 and hom-9: the two home proof points for Sổ Trọ (capability 0 and 1). */
export const HOME_PROOF_POINTS: Localized[] = [
  {
    en: "Electricity bills from meter readings, with each tier shown",
    vi: "Tính tiền điện từ số công tơ, hiện rõ từng bậc giá",
    zh: "根据电表读数计算电费，并列出每一档",
    "zh-hant": "依電表度數計算電費，並列出每一級",
  },
  {
    en: "Receipts, with a separate step to confirm money received",
    vi: "Có biên nhận, và một bước xác nhận riêng trước khi ghi nhận tiền đã nhận",
    zh: "提供收据；确认收款需单独一步",
    "zh-hant": "提供收據；確認收款需獨立一步",
  },
];
