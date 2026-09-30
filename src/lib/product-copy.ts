import { SHARED_LABELS, labelFor, type Language } from "@/data/site";
import type {
  Lifecycle,
  ProofMediaKind,
  PublicLabel,
} from "@/lib/product-schema";
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
 * text; public products are required to carry vi/zh/zh-hant by an architecture test.
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
  "zh-hant": "BlueSkyz Labs 出品",
};

const STATUS_LABELS: Record<PublicLabel, Record<Language, string>> = {
  Preview: { en: "Preview", vi: "Xem trước", zh: "预览", "zh-hant": "預覽" },
  "In development": {
    en: "In development",
    vi: "Đang phát triển",
    zh: "开发中",
    "zh-hant": "開發中",
  },
  Beta: { en: "Beta", vi: "Beta", zh: "测试版", "zh-hant": "測試版" },
  Available: { en: "Available", vi: "Sẵn sàng", zh: "可用", "zh-hant": "可用" },
  Sunsetting: {
    en: "Sunsetting",
    vi: "Sắp ngừng",
    zh: "即将停用",
    "zh-hant": "即將停用",
  },
  Archived: {
    en: "Archived",
    vi: "Đã lưu trữ",
    zh: "已归档",
    "zh-hant": "已歸檔",
  },
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
  concept: { en: "Concept", vi: "Ý tưởng", zh: "概念", "zh-hant": "概念" },
  prototype: {
    en: "Prototype",
    vi: "Nguyên mẫu",
    zh: "原型",
    "zh-hant": "原型",
  },
  development: {
    en: "Development",
    vi: "Đang phát triển",
    zh: "开发",
    "zh-hant": "開發",
  },
  beta: { en: "Beta", vi: "Beta", zh: "测试版", "zh-hant": "測試版" },
  active: {
    en: "Live",
    vi: "Đang hoạt động",
    zh: "上线",
    "zh-hant": "上線",
  },
  maintenance: {
    en: "Maintenance",
    vi: "Bảo trì",
    zh: "维护",
    "zh-hant": "維護",
  },
  sunset: { en: "Sunset", vi: "Ngừng dần", zh: "停用中", "zh-hant": "停用中" },
  archived: {
    en: "Archived",
    vi: "Lưu trữ",
    zh: "已归档",
    "zh-hant": "已歸檔",
  },
};

export function lifecycleLabel(stage: Lifecycle, lang: Language): string {
  return LIFECYCLE_LABELS[stage][lang];
}

/**
 * Plan v5 W3.1 — the one caption resolver for proof media. Wording derives from
 * the record's typed `proof.media.kind`, never from the asset filename.
 * `identity-art` keeps the authored disclosure in SHARED_LABELS.proofCaption;
 * `ui-screenshot` states plainly what it is. A screenshot is only ever claimed
 * by a record whose owner supplied a real capture.
 */
const UI_SCREENSHOT_CAPTIONS: Record<Language, string> = {
  en: "Screenshot of the running application.",
  vi: "Ảnh chụp giao diện ứng dụng đang chạy.",
  zh: "应用运行界面的截图。",
  "zh-hant": "應用程式執行介面的截圖。",
};

export function proofCaptionForKind(
  kind: ProofMediaKind,
  lang: Language,
): string {
  return kind === "ui-screenshot"
    ? UI_SCREENSHOT_CAPTIONS[lang]
    : labelFor(SHARED_LABELS.proofCaption, lang);
}

const PLATFORM_LABELS: Record<string, Record<Language, string>> = {
  web: {
    en: "Web / PWA",
    vi: "Web / PWA",
    zh: "Web / PWA",
    "zh-hant": "Web / PWA",
  },
  "browser-extension": {
    en: "Browser extension",
    vi: "Tiện ích trình duyệt",
    zh: "浏览器扩展",
    "zh-hant": "瀏覽器擴充功能",
  },
  android: {
    en: "Android",
    vi: "Android",
    zh: "Android",
    "zh-hant": "Android",
  },
  ios: { en: "iOS", vi: "iOS", zh: "iOS", "zh-hant": "iOS" },
  macos: { en: "macOS", vi: "macOS", zh: "macOS", "zh-hant": "macOS" },
  windows: {
    en: "Windows",
    vi: "Windows",
    zh: "Windows",
    "zh-hant": "Windows",
  },
  api: { en: "API", vi: "API", zh: "API", "zh-hant": "API" },
};

export function platformLabel(platform: string, lang: Language): string {
  return PLATFORM_LABELS[platform]?.[lang] ?? platform;
}
