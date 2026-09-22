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
}

/**
 * Shared EN/VI experience labels for locale-aware components.
 * Centralized so shared chrome can never leak English into Vietnamese pages.
 */
export const SHARED_LABELS = {
  search: { en: "Search", vi: "Tìm", zh: "搜索" },
  searchPages: { en: "Search pages", vi: "Tìm trang", zh: "搜索页面" },
  menu: { en: "Menu", vi: "Menu", zh: "菜单" },
  contactUs: { en: "Contact us", vi: "Liên hệ", zh: "联系我们" },
  aboutBlueSkyz: {
    en: "About BlueSkyz",
    vi: "Tìm hiểu BlueSkyz",
    zh: "关于 BlueSkyz",
  },
  security: { en: "Security", vi: "Bảo mật", zh: "安全" },
  exploreProducts: {
    en: "Explore products",
    vi: "Khám phá sản phẩm",
    zh: "探索产品",
  },
  exploreAllProducts: {
    en: "Explore all products",
    vi: "Khám phá tất cả sản phẩm",
    zh: "探索全部产品",
  },
  featuredHeading: {
    en: "Featured products",
    vi: "Sản phẩm nổi bật",
    zh: "精选产品",
  },
  featuredBody: {
    en: "Only products with verified public evidence appear here.",
    vi: "Chỉ những sản phẩm có bằng chứng công khai đã xác minh mới xuất hiện tại đây.",
    zh: "此处仅展示具备已核验公开证据的产品。",
  },
  viewProfile: { en: "View profile", vi: "Xem hồ sơ", zh: "查看产品简介" },
  proofCaption: {
    en: "Verified public artifact — not a concept mock.",
    vi: "Bằng chứng công khai đã xác minh — không phải bản mô phỏng ý tưởng.",
    zh: "已核验的公开凭证 — 并非概念稿。",
  },
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
}

const NAV_LABELS: Record<Language, NavLabels> = {
  en: {
    products: "Products",
    about: "About",
    contact: "Contact",
    support: "Support",
    privacy: "Privacy",
    security: "Security",
  },
  vi: {
    products: "Sản phẩm",
    about: "Về BlueSkyz",
    contact: "Liên hệ",
    support: "Hỗ trợ",
    privacy: "Quyền riêng tư",
    security: "Bảo mật",
  },
  zh: {
    products: "产品",
    about: "关于我们",
    contact: "联系我们",
    support: "支持",
    privacy: "隐私",
    security: "安全",
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
