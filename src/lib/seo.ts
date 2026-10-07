import {
  SUPPORTED_LANGUAGES,
  LANGUAGES,
  getAlternatePath,
  type Language,
} from "./i18n.ts";

export function absoluteUrl(base: string, path: string): string {
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

/** Escape `<` so JSON-LD cannot break out of an inline script element. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Committed 512x512 square BlueSkyz mark under `public/`. */
export const ORGANIZATION_LOGO_PATH = "/icons/icon-512x512.png";

/** Site root with the trailing slash that matches the canonical of `/`. */
export function siteRootUrl(siteUrl: string): string {
  return absoluteUrl(siteUrl, "/");
}

/**
 * v12 S2: stable node ids so the page's JSON-LD blocks describe one graph
 * (the WebSite and every SoftwareApplication point at the same Organization)
 * instead of repeating unlinked publisher stubs. Fragment ids on the canonical
 * root; they name entities, never routes.
 */
export function organizationId(siteUrl: string): string {
  return `${siteRootUrl(siteUrl)}#organization`;
}

export function websiteId(siteUrl: string): string {
  return `${siteRootUrl(siteUrl)}#website`;
}

/** The publisher reference every non-Organization node uses. */
function publisherRef(siteUrl: string) {
  return {
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: "BlueSkyz Labs",
    url: siteRootUrl(siteUrl),
  } as const;
}

export function organizationJsonLd(siteUrl: string, foundedYear?: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: "BlueSkyz Labs",
    url: siteRootUrl(siteUrl),
    // Passed from SITE.foundedYear by each page and rendered visibly there.
    ...(foundedYear ? { foundingDate: String(foundedYear) } : {}),
    // Square BlueSkyz mark (Owner decision F11, 2026-10-01). No sameAs and no
    // contactPoint: those stay absent until the Owner supplies real profiles.
    logo: absoluteUrl(siteUrl, ORGANIZATION_LOGO_PATH),
  } as const;
}

export function websiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: "BlueSkyz Labs",
    url: siteRootUrl(siteUrl),
    inLanguage: SUPPORTED_LANGUAGES.map((lang) => LANGUAGES[lang].hreflang),
    publisher: publisherRef(siteUrl),
  } as const;
}

export function productJsonLd(
  product: {
    name: string;
    description: string;
    slug: string;
    mediaUrl?: string;
    /**
     * Plan v5 W3.1 — caption derived from the proof media kind by
     * `proofCaptionForKind`, never from the asset filename.
     */
    mediaCaption?: string;
    platforms: readonly string[];
    /** schema.org category from the product record; omitted when absent. */
    applicationCategory?: string;
  },
  siteUrl: string,
  lang: string,
) {
  const osLabels: Record<string, string> = {
    web: "Web",
    android: "Android",
    ios: "iOS",
    macos: "macOS",
    windows: "Windows",
  };
  const systems = [
    ...new Set(
      product.platforms.flatMap((platform) =>
        osLabels[platform] ? [osLabels[platform]] : [],
      ),
    ),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    url: absoluteUrl(siteUrl, `/${lang}/products/${product.slug}/`),
    inLanguage: languageTag(lang),
    // Do not invent product category/availability or OS from the masterbrand.
    // Category and platform evidence are owned by each product record, never a
    // global default: either is omitted when the record does not declare it.
    ...(product.applicationCategory
      ? { applicationCategory: product.applicationCategory }
      : {}),
    ...(systems.length > 0 ? { operatingSystem: systems.join(", ") } : {}),
    // Same Organization node as the site-wide block (canonical root url).
    publisher: publisherRef(siteUrl),
    ...(product.mediaUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: absoluteUrl(siteUrl, product.mediaUrl),
            ...(product.mediaCaption ? { caption: product.mediaCaption } : {}),
          },
        }
      : {}),
  };
}

/** BCP-47 tag for a routed language (`zh` is Simplified, `zh-hant` Traditional). */
function languageTag(lang: string): string {
  return (
    (LANGUAGES as Record<string, { hreflang: string } | undefined>)[lang]
      ?.hreflang ?? lang
  );
}

export function defaultOgImagePath(): string {
  return "/social/og-default.png";
}

/**
 * Committed pixel size of `defaultOgImagePath()` (1200x630, 1.91:1). Declared
 * only for that image: a page that passes its own `ogImage` has no measured
 * size here, so the layout omits width/height/alt for it instead of guessing.
 */
export const DEFAULT_OG_IMAGE = {
  width: 1200,
  height: 630,
  alt: 'BlueSkyz Labs wordmark and the line "Intelligence. Elevated. Impact." beside a bright angular mark over the Earth seen from space',
} as const;

/**
 * Social-card alt text per locale. The English string is the committed
 * `DEFAULT_OG_IMAGE.alt`; the others restate it with each locale's own
 * hero tagline (src/content/pages/<lang>/index.yaml), so a vi/zh social
 * preview is not described in English.
 */
export const DEFAULT_OG_IMAGE_ALT: Record<Language, string> = {
  en: DEFAULT_OG_IMAGE.alt,
  vi: 'Chữ BlueSkyz Labs và khẩu hiệu "Trí tuệ. Nâng tầm. Tác động." cạnh biểu tượng góc cạnh phát sáng, nền là Trái Đất nhìn từ vũ trụ',
  zh: "BlueSkyz Labs 字标与标语“智能。提升。影响。”，旁边是明亮的棱角标志，背景为从太空俯瞰的地球",
  "zh-hant":
    "BlueSkyz Labs 字標與標語「智慧。提升。影響。」，旁邊是明亮的稜角標誌，背景為從太空俯瞰的地球",
};

export function canonicalForPath(path: string, siteUrl: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return absoluteUrl(siteUrl, normalized);
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

export function hreflangLinks(path: string, siteUrl: string): HreflangLink[] {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    hreflang: LANGUAGES[lang].hreflang,
    href: canonicalForPath(getAlternatePath(path, lang), siteUrl),
  }));
}

/**
 * Owner decision F16 (2026-10-01): the language gateway `/` is indexable and
 * is the `x-default` of the home cluster only (the gateway and the four
 * localized homes). Every other page keeps its English counterpart.
 */
export function isHomeClusterPath(path: string): boolean {
  return path === "/" || /^\/(en|vi|zh-hant|zh)\/$/.test(path);
}

export function xDefaultPath(path: string): string {
  return isHomeClusterPath(path) ? "/" : getAlternatePath(path, "en");
}

// v3 G4 — Decision Room is a static public route in both locales.
export const PUBLIC_STATIC_PATHS = [
  "/en/",
  "/en/decision-room/",
  "/en/products/",
  "/en/about/",
  "/en/contact/",
  "/en/support/",
  "/en/privacy/",
  "/en/security/",
  "/en/architecture/",
  "/en/verify/",
  "/en/editions/",
  "/en/dossier/",
  "/en/dossier/print/",
  "/vi/",
  "/vi/decision-room/",
  "/vi/products/",
  "/vi/about/",
  "/vi/contact/",
  "/vi/support/",
  "/vi/privacy/",
  "/vi/security/",
  "/vi/architecture/",
  "/vi/verify/",
  "/vi/editions/",
  "/vi/dossier/",
  "/vi/dossier/print/",
  "/zh/",
  "/zh/decision-room/",
  "/zh/products/",
  "/zh/about/",
  "/zh/contact/",
  "/zh/support/",
  "/zh/privacy/",
  "/zh/security/",
  "/zh/architecture/",
  "/zh/verify/",
  "/zh/editions/",
  "/zh/dossier/",
  "/zh/dossier/print/",
  "/zh-hant/",
  "/zh-hant/decision-room/",
  "/zh-hant/products/",
  "/zh-hant/about/",
  "/zh-hant/contact/",
  "/zh-hant/support/",
  "/zh-hant/privacy/",
  "/zh-hant/security/",
  "/zh-hant/architecture/",
  "/zh-hant/verify/",
  "/zh-hant/editions/",
  "/zh-hant/dossier/",
  "/zh-hant/dossier/print/",
] as const;

/**
 * Printable restatements of `/<lang>/dossier/`. They stay public and linked
 * but are `noindex, follow` and absent from the sitemap (duplicative of the
 * dossier page; SEO-11).
 */
export function isNoindexPath(path: string): boolean {
  return /^\/(en|vi|zh|zh-hant)\/dossier\/print\/$/.test(path);
}
