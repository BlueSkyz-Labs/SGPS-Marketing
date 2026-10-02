import type { Language } from "@/data/site";

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
