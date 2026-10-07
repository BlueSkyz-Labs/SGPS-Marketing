import { publicMailboxForRole } from "../lib/public-mailbox.ts";

const localFallback = "http://localhost:4321";

export const SITE = {
  name: "BlueSkyz Labs",
  /** Owner-confirmed operating year; do not infer this from domain history. */
  foundedYear: 2026,
  /** Primary hero line — BlueSkyz Labs Production Brand Kit v4. */
  taglineLead: "Intelligence. Elevated.",
  taglineAccent: "Impact.",
  /** Supporting sentence under the tagline. */
  proposition:
    "We build intelligent products that empower people and elevate the way work gets done.",
  supporting: "A higher perspective builds a brighter tomorrow.",
  motto: "Build with clarity. Scale with confidence.",
  url: import.meta.env?.PUBLIC_SITE_URL?.trim() || localFallback,
  contactEmail: publicMailboxForRole(
    import.meta.env?.PUBLIC_CONTACT_EMAIL,
    "contact",
  ),
  supportEmail: publicMailboxForRole(
    import.meta.env?.PUBLIC_SUPPORT_EMAIL,
    "support",
  ),
  privacyEmail: publicMailboxForRole(
    import.meta.env?.PUBLIC_PRIVACY_EMAIL,
    "privacy",
  ),
  securityEmail: publicMailboxForRole(
    import.meta.env?.PUBLIC_SECURITY_EMAIL,
    "security",
  ),
  founderEmail: publicMailboxForRole(
    import.meta.env?.PUBLIC_FOUNDER_EMAIL,
    "founder",
  ),
} as const;

/** Public GitHub private vulnerability reporting (SECURITY.md). */
export const SECURITY_ADVISORY_URL =
  "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new";

import type { Language } from "../lib/i18n.ts";

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
    en: "What it helps you do",
    vi: "Giúp bạn làm gì",
    zh: "能帮你做什么",
    "zh-hant": "能幫你做什麼",
  },
  scopeHeading: {
    en: "What we're building",
    vi: "Đang xây dựng những gì",
    zh: "正在开发的内容",
    "zh-hant": "開發中的內容",
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
    vi: "Về BlueSkyz",
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
  continuationHeading: {
    en: "Also in development",
    vi: "Cũng đang phát triển",
    zh: "同样在开发中",
    "zh-hant": "同樣在開發中",
  },
  trustHeading: {
    en: "Check what we say",
    vi: "Kiểm chứng điều chúng tôi nói",
    zh: "核实我们所说的",
    "zh-hant": "查證我們所說的",
  },
  trustBody: {
    en: "Our public claims link to the sources behind them.",
    vi: "Các tuyên bố công khai của chúng tôi đều dẫn tới nguồn đã công bố.",
    zh: "我们的公开声明都链接到其依据来源。",
    "zh-hant": "我們的公開聲明都連結到其依據來源。",
  },
  trustCta: {
    en: "Check our claims",
    vi: "Xem các tuyên bố",
    zh: "查看依据",
    "zh-hant": "查看依據",
  },
  viewProfile: {
    en: "View profile",
    vi: "Xem hồ sơ",
    zh: "查看产品简介",
    "zh-hant": "檢視產品簡介",
  },
  signIn: { en: "Sign in", vi: "Đăng nhập", zh: "登录", "zh-hant": "登入" },
  /** Qualified label: the sign-in page is for existing users, not an open sign-up. */
  signInExisting: {
    en: "Sign in (existing users)",
    vi: "Đăng nhập (người dùng hiện có)",
    zh: "登录（现有用户）",
    "zh-hant": "登入（現有使用者）",
  },
  /** Same wording as the product showcase guide link. */
  readGuide: {
    en: "Read the getting-started guide",
    vi: "Xem hướng dẫn bắt đầu",
    zh: "阅读入门指南",
    "zh-hant": "閱讀入門指南",
  },
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
    en: "Site index",
    vi: "Mục lục trang",
    zh: "网站目录",
    "zh-hant": "網站目錄",
  },
  platforms: { en: "Platforms", vi: "Nền tảng", zh: "平台", "zh-hant": "平台" },
  operatingSince: {
    en: "Operating since",
    vi: "Bắt đầu hoạt động từ năm",
    zh: "开始运营于",
    "zh-hant": "開始營運於",
  },
  strategicContact: {
    en: "Business / product contact",
    vi: "Liên hệ kinh doanh / sản phẩm",
    zh: "商务 / 产品联系",
    "zh-hant": "商務 / 產品聯絡",
  },
  generalContact: {
    en: "Business / general",
    vi: "Kinh doanh / chung",
    zh: "商务 / 一般咨询",
    "zh-hant": "商務 / 一般諮詢",
  },
  productSupport: {
    en: "Product support",
    vi: "Hỗ trợ sản phẩm",
    zh: "产品支持",
    "zh-hant": "產品支援",
  },
  privacyContact: {
    en: "Privacy enquiries",
    vi: "Liên hệ về quyền riêng tư",
    zh: "隐私咨询",
    "zh-hant": "隱私諮詢",
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
  architecture: string;
  verify: string;
  /** Existing /editions page title (no new copy). */
  editions: string;
  /** Existing /dossier page title (no new copy). */
  dossier: string;
}

const NAV_LABELS: Record<Language, NavLabels> = {
  en: {
    products: "Products",
    about: "About",
    contact: "Contact",
    support: "Support",
    privacy: "Privacy",
    security: "Security",
    architecture: "How this site is built",
    verify: "Verify",
    editions: "Collections",
    dossier: "Printable summary",
  },
  vi: {
    products: "Sản phẩm",
    about: "Về BlueSkyz",
    contact: "Liên hệ",
    support: "Hỗ trợ",
    privacy: "Quyền riêng tư",
    security: "Bảo mật",
    architecture: "Cách trang web này được xây dựng",
    verify: "Xác minh",
    editions: "Tuyển tập",
    dossier: "Bản tóm tắt để in",
  },
  zh: {
    products: "产品",
    about: "关于我们",
    contact: "联系我们",
    support: "支持",
    privacy: "隐私",
    security: "安全",
    architecture: "本站如何构建",
    verify: "核实",
    editions: "合集",
    dossier: "可打印摘要",
  },
  "zh-hant": {
    products: "產品",
    about: "關於我們",
    contact: "聯絡我們",
    support: "支援",
    privacy: "隱私",
    security: "安全",
    architecture: "本站如何建置",
    verify: "查證",
    editions: "合集",
    dossier: "可列印摘要",
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
    { label: l.verify, href: `/${lang}/verify/` },
    { label: l.architecture, href: `/${lang}/architecture/` },
    { label: l.editions, href: `/${lang}/editions/` },
    { label: l.dossier, href: `/${lang}/dossier/` },
  ];
}

export interface FooterGroup {
  /** Existing site strings only (brand name, "Trust", "Evidence"). */
  label: string;
  links: NavItem[];
}

const FOOTER_GROUP_LABELS: Record<
  "trust" | "evidence",
  Record<Language, string>
> = {
  trust: { en: "Trust", vi: "Tin cậy", zh: "信任", "zh-hant": "信任" },
  evidence: {
    en: "Evidence",
    vi: "Bằng chứng",
    zh: "证据",
    "zh-hant": "證據",
  },
};

/** The footer links grouped by intent; same set and order as getFooterLinks. */
export function getFooterGroups(lang: Language): FooterGroup[] {
  const byPath = new Map(
    getFooterLinks(lang).map((link) => [link.href.split("/")[2], link]),
  );
  const pick = (...slugs: string[]): NavItem[] =>
    slugs.map((slug) => byPath.get(slug)!);
  return [
    {
      label: SITE.name,
      links: pick("products", "about", "contact", "support"),
    },
    {
      label: FOOTER_GROUP_LABELS.trust[lang],
      links: pick("privacy", "security", "verify", "architecture"),
    },
    {
      label: FOOTER_GROUP_LABELS.evidence[lang],
      links: pick("editions", "dossier"),
    },
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

/**
 * The brand line per locale. zh and zh-hant reuse the renderings already
 * published in the home hero (`src/content/pages/<lang>/index.yaml`, the Hero
 * company fallback and `docs/notes/zh-localization-glossary.md`); nothing here
 * is new copy. Consumers render `lead` then `accent`.
 */
export const BRAND_TAGLINE: Record<
  "en" | "vi" | "zh" | "zh-hant",
  { lead: string; accent: string }
> = {
  en: { lead: SITE.taglineLead, accent: SITE.taglineAccent },
  vi: { lead: "Trí tuệ. Nâng tầm.", accent: "Tác động." },
  zh: { lead: "智能。提升。", accent: "影响。" },
  "zh-hant": { lead: "智慧。提升。", accent: "影響。" },
};
