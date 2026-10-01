import type { APIRoute } from "astro";
import { SITE } from "@/data/site";
import { getPublicProducts } from "@/lib/products";
import { getGuideProducts } from "@/lib/showcases";
import { absoluteUrl, isNoindexPath, PUBLIC_STATIC_PATHS } from "@/lib/seo";
import { getEvidencePassportIds } from "@/lib/claims";
import { EDITIONS } from "@/data/editions";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { isNonProductionSiteUrl } from "@/lib/truth";
import { lastmodForPath } from "@/lib/git-lastmod";

export const prerender = true;

/** `lastmod` comes from git per route and is omitted when not accurate
 * (shallow clone, no history); it is never the build time. */
function urlEntry(loc: string): string {
  const path = new URL(loc).pathname;
  const lastmod = lastmodForPath(path);
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    "  </url>",
  ].join("\n");
}

export const GET: APIRoute = async () => {
  const products = (await getPublicProducts()).map((product) => ({
    slug: product.data.slug,
    name: product.data.name,
  }));
  const guideSlugs = (await getGuideProducts()).map(
    ({ product }) => product.data.slug,
  );
  const evidenceIds = getEvidencePassportIds(products);
  const locs = isNonProductionSiteUrl(SITE.url)
    ? []
    : [
        // Language gateway (Owner decision F16, 2026-10-01): indexable.
        absoluteUrl(SITE.url, "/"),
        ...PUBLIC_STATIC_PATHS.filter((path) => !isNoindexPath(path)).map(
          (path) => absoluteUrl(SITE.url, path),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          products.map((product) =>
            absoluteUrl(SITE.url, `/${lang}/products/${product.slug}/`),
          ),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          guideSlugs.map((slug) =>
            absoluteUrl(SITE.url, `/${lang}/products/${slug}/guide/`),
          ),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          evidenceIds.map((id) =>
            absoluteUrl(SITE.url, `/${lang}/evidence/${id}/`),
          ),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          EDITIONS.map((edition) =>
            absoluteUrl(SITE.url, `/${lang}/editions/${edition.id}/`),
          ),
        ),
      ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locs.map(urlEntry),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
