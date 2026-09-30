const localFallback = "http://localhost:4321";

export const SITE = {
  name: "BlueSkyz Labs",
  /** Primary hero line — BlueSkyz Labs Production Brand Kit v4. */
  taglineLead: "Intelligence. Elevated.",
  taglineAccent: "Impact.",
  /** Supporting sentence under the tagline. */
  proposition:
    "We build intelligent products that empower people and elevate the way work gets done.",
  supporting: "A higher perspective builds a brighter tomorrow.",
  motto: "Build with clarity. Scale with confidence.",
  url: import.meta.env?.PUBLIC_SITE_URL?.trim() || localFallback,
  contactEmail: import.meta.env?.PUBLIC_CONTACT_EMAIL?.trim() || null,
  securityEmail: import.meta.env?.PUBLIC_SECURITY_EMAIL?.trim() || null,
} as const;

/** Public GitHub private vulnerability reporting (SECURITY.md). */
export const SECURITY_ADVISORY_URL =
  "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";

import type { Language } from "@/lib/i18n";

/** Locale set is owned by `@/lib/i18n`; re-exported so existing importers keep working. */
export type { Language };

export interface LocalizedLabel {
  en: string;
  vi: string;
  zh: string;
  "zh-hant": string;
}

/**
 * Shared EN/VI experience labels for locale-aware components.
 * Centralized so shared chrome can never leak English into Vietnamese pages.
 */
export const SHARED_LABELS = {
  flagshipEyebrow: {
    en: "Flagship product",
    vi: "Sản phẩm chủ lực",
    zh: "旗舰产品",
    "zh-hant": "旗艦產品",
  },
  jobsHeading: {
    en: "What it helps people do",
    vi: "Việc sản phẩm hỗ trợ",
    zh: "可完成的工作",
    "zh-hant": "可完成的工作",
  },
  scopeHeading: {
    en: "Development scope",
    vi: "Phạm vi phát triển",
    zh: "开发范围",
    "zh-hant": "開發範圍",
  },
  search: { en: "Search", vi: "Tìm", zh: "搜索", "zh-hant": "搜尋" },
  searchPages: {
    en: "Search pages",
    vi: "Tìm trang",
    zh: "搜索页面",
    "zh-hant": "搜尋頁面",
  },
  menu: { en: "Menu", vi: "Menu", zh: "菜单", "zh-hant": "選單" },
  contactUs: {
    en: "Contact us",
    vi: "Liên hệ",
    zh: "联系我们",
    "zh-hant": "聯絡我們",
  },
  aboutBlueSkyz: {
    en: "About BlueSkyz",
    vi: "Tìm hiểu BlueSkyz",
    zh: "关于 BlueSkyz",
    "zh-hant": "關於 BlueSkyz",
  },
  security: { en: "Security", vi: "Bảo mật", zh: "安全", "zh-hant": "安全" },
  exploreProducts: {
    en: "Explore products",
    vi: "Khám phá sản phẩm",
    zh: "探索产品",
    "zh-hant": "探索產品",
  },
  exploreAllProducts: {
    en: "Explore all products",
    vi: "Khám phá tất cả sản phẩm",
    zh: "探索全部产品",
    "zh-hant": "探索全部產品",
  },
  featuredHeading: {
    en: "Featured products",
    vi: "Sản phẩm nổi bật",
    zh: "精选产品",
    "zh-hant": "精選產品",
  },
  featuredBody: {
    en: "Explore products in development. Availability and supporting material are described individually.",
    vi: "Khám phá các sản phẩm đang phát triển. Trạng thái và tư liệu tham khảo được ghi rõ cho từng sản phẩm.",
    zh: "探索开发中的产品。每款产品均分别说明其状态与参考资料。",
    "zh-hant": "探索開發中的產品。每款產品均分別說明其狀態與參考資料。",
  },
  continuationHeading: {
    en: "The rest of the house, in development",
    vi: "Những sản phẩm khác đang được phát triển",
    zh: "其他正在开发的产品",
    "zh-hant": "其他正在開發的產品",
  },
  continuationBody: {
    en: "Each product shows its recorded stage — concept, prototype or development — its platform and an honest next step.",
    vi: "Mỗi sản phẩm hiển thị đúng giai đoạn đã ghi nhận — ý tưởng, nguyên mẫu hay phát triển — cùng nền tảng và bước tiếp theo trung thực.",
    zh: "每款产品均标明其记录的阶段（概念、原型或开发）、平台以及如实的下一步。",
    "zh-hant":
      "每款產品均標明其記錄的階段（概念、原型或開發）、平台以及如實的下一步。",
  },
  viewProfile: {
    en: "View profile",
    vi: "Xem hồ sơ",
    zh: "查看产品简介",
    "zh-hant": "檢視產品簡介",
  },
  signIn: { en: "Sign in", vi: "Đăng nhập", zh: "登录", "zh-hant": "登入" },
  proofCaption: {
    en: "Brand identity artwork — not a screenshot of the running application.",
    vi: "Hình ảnh nhận diện thương hiệu — không phải ảnh chụp giao diện ứng dụng.",
    zh: "品牌视觉素材，并非应用运行界面的截图。",
    "zh-hant": "品牌視覺素材，並非應用程式執行介面的截圖。",
  },
  primaryNav: { en: "Primary", vi: "Chính", zh: "主导航", "zh-hant": "主導覽" },
  mobileNav: {
    en: "Mobile",
    vi: "Di động",
    zh: "移动导航",
    "zh-hant": "行動導覽",
  },
  footerNav: {
    en: "Footer",
    vi: "Chân trang",
    zh: "页脚导航",
    "zh-hant": "頁尾導覽",
  },
  nextSteps: {
    en: "Next steps",
    vi: "Bước tiếp theo",
    zh: "下一步",
    "zh-hant": "下一步",
  },
  houseIndex: {
    en: "House index",
    vi: "Mục lục ngôi nhà",
    zh: "网站目录",
    "zh-hant": "網站目錄",
  },
  // Accessible name for the One House principle matrix — the four principles
  // render as cards, so the list needs a locale-aware label of its own.
  brandPrinciples: {
    en: "Brand principles",
    vi: "Nguyên tắc thương hiệu",
    zh: "品牌原则",
    "zh-hant": "品牌原則",
  },
  platforms: { en: "Platforms", vi: "Nền tảng", zh: "平台", "zh-hant": "平台" },
} as const satisfies Record<string, LocalizedLabel>;

export function labelFor(
  label: LocalizedLabel,
  lang: Language | undefined,
): string {
  return label[lang ?? "en"];
}

interface NavItem {
  label: string;
  href: string;
}

interface NavLabels {
  products: string;
  about: string;
  contact: string;
  support: string;
  privacy: string;
  security: string;
  architecture: string;
}

const NAV_LABELS: Record<Language, NavLabels> = {
  en: {
    products: "Products",
    about: "About",
    contact: "Contact",
    support: "Support",
    privacy: "Privacy",
    security: "Security",
    architecture: "Architecture",
  },
  vi: {
    products: "Sản phẩm",
    about: "Về BlueSkyz",
    contact: "Liên hệ",
    support: "Hỗ trợ",
    privacy: "Quyền riêng tư",
    security: "Bảo mật",
    architecture: "Kiến trúc",
  },
  zh: {
    products: "产品",
    about: "关于我们",
    contact: "联系我们",
    support: "支持",
    privacy: "隐私",
    security: "安全",
    architecture: "架构",
  },
  "zh-hant": {
    products: "產品",
    about: "關於我們",
    contact: "聯絡我們",
    support: "支援",
    privacy: "隱私",
    security: "安全",
    architecture: "架構",
  },
};

export function getNav(lang: Language): NavItem[] {
  const l = NAV_LABELS[lang];
  return [
    { label: l.products, href: `/${lang}/products/` },
    { label: l.about, href: `/${lang}/about/` },
    { label: l.contact, href: `/${lang}/contact/` },
  ];
}

export function getFooterLinks(lang: Language): NavItem[] {
  const l = NAV_LABELS[lang];
  return [
    { label: l.products, href: `/${lang}/products/` },
    { label: l.about, href: `/${lang}/about/` },
    { label: l.contact, href: `/${lang}/contact/` },
    { label: l.support, href: `/${lang}/support/` },
    { label: l.privacy, href: `/${lang}/privacy/` },
    { label: l.security, href: `/${lang}/security/` },
    { label: l.architecture, href: `/${lang}/architecture/` },
  ];
}

/** v4 brand principles from the owner production kit (not product claims). */
export const BRAND_PRINCIPLES = [
  {
    name: "Intelligence",
    summary: "Deep thinking. Smart solutions.",
  },
  {
    name: "Elevation",
    summary: "Better perspective. Greater impact.",
  },
  {
    name: "Trust",
    summary: "Open claims. Verifiable evidence.",
  },
  {
    name: "Impact",
    summary: "Real value. Real change.",
  },
] as const;
