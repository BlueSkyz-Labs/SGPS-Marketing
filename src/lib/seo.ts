import { SUPPORTED_LANGUAGES, LANGUAGES, getAlternatePath } from "./i18n.ts";

export function absoluteUrl(base: string, path: string): string {
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

/** Escape `<` so JSON-LD cannot break out of an inline script element. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Committed 512x512 square BlueSkyz mark under `public/`. */
export const ORGANIZATION_LOGO_PATH = "/icons/icon-512x512.png";

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BlueSkyz Labs",
    url: siteUrl,
    // Square BlueSkyz mark (Owner decision F11, 2026-10-01). No sameAs and no
    // contactPoint: those stay absent until the Owner supplies real profiles.
    logo: absoluteUrl(siteUrl, ORGANIZATION_LOGO_PATH),
  } as const;
}

export function websiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BlueSkyz Labs",
    url: siteUrl,
    inLanguage: SUPPORTED_LANGUAGES.map((lang) => LANGUAGES[lang].hreflang),
    publisher: {
      "@type": "Organization",
      name: "BlueSkyz Labs",
      url: siteUrl,
    },
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
    // Platform evidence is owned by each product record, not a global default.
    ...(systems.length > 0 ? { operatingSystem: systems.join(", ") } : {}),
    publisher: {
      "@type": "Organization",
      name: "BlueSkyz Labs",
      url: siteUrl,
    },
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
