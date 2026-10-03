import type { Language } from "@/data/site";
import { CANONICAL_PUBLIC_SITE_ORIGIN } from "./truth.ts";

/** Locale-prefixed product index path (e.g. `/en/products/`, `/vi/products/`). */
export function getProductIndexPath(lang: Language): string {
  return `/${lang}/products/`;
}

/** Locale-prefixed product profile path for a given product slug. */
export function getProductProfilePath(lang: Language, slug: string): string {
  return `/${lang}/products/${slug}/`;
}

/** Product icon asset path (static, not locale-prefixed — served from public/). */
export function getProductIconPath(slug: string): string {
  return `/products/${slug}/icon.png`;
}

/**
 * 112 px derivative of the product icon for small tiles (36-56 px rendered, so
 * 2x density). Same artwork, only resized: the 256/512 px `icon.png` stays the
 * recorded master. Small slots must not download the master ahead of the LCP
 * text's fonts (Lighthouse's simulated LCP waits on every request that
 * finishes before the hero paints).
 */
export function getProductIconThumbPath(slug: string): string {
  return `/products/${slug}/icon-112.png`;
}

const LOCALE_PREFIX = /^\/(?:en|vi|zh-hant|zh)(\/.*)?$/;

/**
 * Registry proof links (privacy/security/support) are stored as absolute
 * canonical URLs, usually in English. On a localized page a link back into
 * this site must stay on the reader's locale and origin: map
 * `https://blueskyzlabs.com/<any-locale>/<rest>` to `/<lang>/<rest>`.
 * External URLs are returned unchanged. Presentation only: the registry value
 * is not rewritten.
 */
export function localizeSiteHref(href: string, lang: Language): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  if (url.origin !== CANONICAL_PUBLIC_SITE_ORIGIN) return href;
  const match = url.pathname.match(LOCALE_PREFIX);
  const rest = match ? (match[1] ?? "/") : url.pathname;
  return `/${lang}${rest}${url.search}${url.hash}`;
}
