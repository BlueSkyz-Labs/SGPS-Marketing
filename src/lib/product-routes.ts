import type { Language } from "@/data/site";

/** Locale-prefixed product index path (e.g. `/en/products/`, `/vi/products/`). */
export function getProductIndexPath(lang: Language): string {
  return `/${lang}/products/`;
}

/** Locale-prefixed product profile path for a given product slug. */
export function getProductProfilePath(lang: Language, slug: string): string {
  return `/${lang}/products/${slug}/`;
}
