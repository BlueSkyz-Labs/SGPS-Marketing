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
 * Home one-liners under the flagship name (hero) and in the product house.
 * v12 S2 (customer-led): the Sổ Trọ line now answers the landlord's own
 * question (which rooms have not paid, what needs doing today), reframing the
 * registry's first job (`jobs[0]` in `src/content/products/sotro.yaml`) and
 * the "rooms not yet paid" state the real home capture shows. It adds no
 * capability. Sổ Tâm keeps the registry copy except in English, where
 * "local-first" is said in plain words. zh and zh-hant are NOT VERIFIED
 * (native review pending).
 */
export const HOME_ONE_LINER: Record<
  string,
  Partial<Record<Language, string>> | undefined
> = {
  sotro: {
    en: "For landlords in Vietnam: see what is still unpaid this month and what needs doing today.",
    vi: "Dành cho chủ trọ ở Việt Nam: xem tháng này còn ai chưa đóng tiền và hôm nay cần lo việc gì.",
    zh: "给越南房东：查看本月还有谁没交租、今天要处理什么。",
    "zh-hant": "給越南房東：查看本月還有誰沒繳租、今天要處理什麼。",
  },
  sotam: {
    en: "A private, local-first journal for reflections and memories.",
    vi: "Cuốn nhật ký riêng tư, ưu tiên lưu trên máy, để viết suy nghĩ và giữ kỷ niệm.",
    zh: "私密、本地优先的日记，用来写下所思所想、留住回忆。",
    "zh-hant": "私密、本機優先的日記，用來寫下所思所想、留住回憶。",
  },
};

/**
 * v12 S2: one outcome line that opens the home flagship act, before the two
 * proof points. It restates the registry's second job (`jobs[1]`: dependable
 * room, tenant, meter and monthly charge records) as what the landlord gets.
 * zh and zh-hant are NOT VERIFIED (native review pending).
 */
export const HOME_FLAGSHIP_LEAD: Record<string, Localized | undefined> = {
  sotro: {
    en: "Rooms, tenants, meter readings and monthly charges, kept as dependable records.",
    vi: "Phòng, người thuê, số điện nước và các khoản thu hằng tháng, ghi lại cho gọn, cho chắc.",
    zh: "房间、租客、水电表读数和每月费用，记录清楚可靠。",
    "zh-hant": "房間、房客、水電表度數和每月費用，記錄清楚可靠。",
  },
};

/** hom-8 and hom-9: the two home proof points for Sổ Trọ (capability 0 and 1). */
export const HOME_PROOF_POINTS: Localized[] = [
  {
    en: "Electricity bills from meter readings, with each tier shown",
    vi: "Tính tiền điện từ số công tơ, hiện rõ từng bậc giá",
    zh: "根据电表读数计算电费，并清楚列出每一档",
    "zh-hant": "依電表度數計算電費，並清楚列出每一級",
  },
  {
    en: "Receipts, with a separate step to confirm money received",
    vi: "Có biên nhận, và một bước xác nhận riêng trước khi ghi nhận tiền đã nhận",
    zh: "提供收据；确认收款需单独一步",
    "zh-hant": "提供收據；確認收款需獨立一步",
  },
];
