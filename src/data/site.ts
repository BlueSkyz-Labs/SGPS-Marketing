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

export type Language = "en" | "vi";

export interface LocalizedLabel {
  en: string;
  vi: string;
}

/**
 * Shared EN/VI experience labels for locale-aware components.
 * Centralized so shared chrome can never leak English into Vietnamese pages.
 */
export const SHARED_LABELS = {
  search: { en: "Search", vi: "Tìm" },
  searchPages: { en: "Search pages", vi: "Tìm trang" },
  menu: { en: "Menu", vi: "Menu" },
  contactUs: { en: "Contact us", vi: "Liên hệ" },
  aboutBlueSkyz: { en: "About BlueSkyz", vi: "Về BlueSkyz" },
  security: { en: "Security", vi: "Bảo mật" },
  exploreProducts: { en: "Explore products", vi: "Khám phá sản phẩm" },
  exploreAllProducts: {
    en: "Explore all products",
    vi: "Khám phá tất cả sản phẩm",
  },
  featuredHeading: { en: "Featured products", vi: "Sản phẩm nổi bật" },
  featuredBody: {
    en: "Only products with verified public evidence appear here.",
    vi: "Chỉ những sản phẩm có bằng chứng công khai đã xác minh mới xuất hiện tại đây.",
  },
  viewProfile: { en: "View profile", vi: "Xem hồ sơ" },
  proofCaption: {
    en: "Verified public artifact — not a concept mock.",
    vi: "Bằng chứng công khai đã xác minh — không phải bản mô phỏng ý tưởng.",
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
    summary: "Reliable, secure, consistent.",
  },
  {
    name: "Impact",
    summary: "Real value. Real change.",
  },
] as const;
