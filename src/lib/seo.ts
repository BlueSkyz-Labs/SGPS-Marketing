import { SUPPORTED_LANGUAGES, LANGUAGES, getAlternatePath } from "./i18n.ts";

export function absoluteUrl(base: string, path: string): string {
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

/** Escape `<` so JSON-LD cannot break out of an inline script element. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BlueSkyz Labs",
    url: siteUrl,
  } as const;
}

export function websiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BlueSkyz Labs",
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: "BlueSkyz Labs",
      url: siteUrl,
    },
  } as const;
}

export function defaultOgImagePath(): string {
  return "/social/og-default.png";
}

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
  "/vi/",
  "/vi/decision-room/",
  "/vi/products/",
  "/vi/about/",
  "/vi/contact/",
  "/vi/support/",
  "/vi/privacy/",
  "/vi/security/",
] as const;
