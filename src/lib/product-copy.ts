import type { Language } from "@/data/site";
import type { Lifecycle, PublicLabel } from "@/lib/product-schema";
import type { ProductEntry } from "@/lib/products";

type ProductData = ProductEntry["data"];

/**
 * Plan v5 W3.4 — localized product copy.
 *
 * Presentation-only projection of a product record into the reader's
 * language. English fields remain the canonical truth used for claim/proof
 * binding (`capabilityKeys`), SEO provenance and truth tripwires; localized
 * strings come only from the record's own `i18n` block. When a locale block is
 * absent (fixtures, drafts) the English record is shown rather than invented
 * text; public products are required to carry vi/zh by an architecture test.
 */
export interface ProductCopy {
  shortDescription: string;
  jobs: string[];
  capabilities: string[];
  /** English capability strings, index-aligned with `capabilities`. */
  capabilityKeys: string[];
  primaryActionLabel: string;
  statusLabel: string;
  /** Localized rendering of the fixed endorsement literal. */
  endorsement: string;
}

const ENDORSEMENT: Record<Language, string> = {
  en: "A BlueSkyz Labs product",
  vi: "Một sản phẩm của BlueSkyz Labs",
  zh: "BlueSkyz Labs 出品",
};

const STATUS_LABELS: Record<PublicLabel, Record<Language, string>> = {
  Preview: { en: "Preview", vi: "Xem trước", zh: "预览" },
  "In development": {
    en: "In development",
    vi: "Đang phát triển",
    zh: "开发中",
  },
  Beta: { en: "Beta", vi: "Beta", zh: "测试版" },
  Available: { en: "Available", vi: "Sẵn sàng", zh: "可用" },
  Sunsetting: { en: "Sunsetting", vi: "Sắp ngừng", zh: "即将停用" },
  Archived: { en: "Archived", vi: "Đã lưu trữ", zh: "已归档" },
};

export function statusLabelFor(label: PublicLabel, lang: Language): string {
  return STATUS_LABELS[label][lang];
}

export function productCopy(data: ProductData, lang: Language): ProductCopy {
  const capabilityKeys = data.capabilities ?? [];
  const local = lang === "en" ? undefined : data.i18n?.[lang];
  return {
    shortDescription: local?.shortDescription ?? data.shortDescription,
    jobs: local?.jobs ?? data.jobs ?? [],
    capabilities: local?.capabilities ?? capabilityKeys,
    capabilityKeys,
    primaryActionLabel: local?.primaryActionLabel ?? data.primaryAction.label,
    statusLabel: statusLabelFor(data.publicLabel, lang),
    endorsement: lang === "en" ? data.endorsement : ENDORSEMENT[lang],
  };
}

/** Every schema-valid lifecycle stage, including terminal states. */
export const LIFECYCLE_LADDER: readonly Lifecycle[] = [
  "concept",
  "prototype",
  "development",
  "beta",
  "active",
  "maintenance",
  "sunset",
  "archived",
];

const LIFECYCLE_LABELS: Record<Lifecycle, Record<Language, string>> = {
  concept: { en: "Concept", vi: "Ý tưởng", zh: "概念" },
  prototype: { en: "Prototype", vi: "Nguyên mẫu", zh: "原型" },
  development: { en: "Development", vi: "Phát triển", zh: "开发" },
  beta: { en: "Beta", vi: "Beta", zh: "测试版" },
  active: { en: "Live", vi: "Vận hành", zh: "上线" },
  maintenance: { en: "Maintenance", vi: "Bảo trì", zh: "维护" },
  sunset: { en: "Sunset", vi: "Ngừng dần", zh: "停用中" },
  archived: { en: "Archived", vi: "Lưu trữ", zh: "已归档" },
};

export function lifecycleLabel(stage: Lifecycle, lang: Language): string {
  return LIFECYCLE_LABELS[stage][lang];
}

const PLATFORM_LABELS: Record<string, Record<Language, string>> = {
  web: { en: "Web / PWA", vi: "Web / PWA", zh: "Web / PWA" },
  "browser-extension": {
    en: "Browser extension",
    vi: "Tiện ích trình duyệt",
    zh: "浏览器扩展",
  },
  android: { en: "Android", vi: "Android", zh: "Android" },
  ios: { en: "iOS", vi: "iOS", zh: "iOS" },
  macos: { en: "macOS", vi: "macOS", zh: "macOS" },
  windows: { en: "Windows", vi: "Windows", zh: "Windows" },
  api: { en: "API", vi: "API", zh: "API" },
};

export function platformLabel(platform: string, lang: Language): string {
  return PLATFORM_LABELS[platform]?.[lang] ?? platform;
}
